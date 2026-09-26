# Taskbar Monitor - Automated Windows 11 Build & Setup
$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Taskbar Monitor + Soundcore Battery Build System      " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 0. Locate Project Directory
$slnPath = Join-Path $ScriptDir "TaskbarMonitor.sln"
if (!(Test-Path $slnPath)) {
    $searchLocations = @(
        (Join-Path $ScriptDir "*taskbar*"),
        (Join-Path $env:USERPROFILE "Desktop\*taskbar*"),
        (Join-Path $env:USERPROFILE "Downloads\*taskbar*")
    )
    foreach ($loc in $searchLocations) {
        $candidate = Get-ChildItem -Path $loc -Directory -ErrorAction SilentlyContinue | Where-Object { 
            Test-Path (Join-Path $_.FullName "TaskbarMonitor.sln") 
        } | Select-Object -First 1
        if ($candidate) {
            $ScriptDir = $candidate.FullName
            $slnPath = Join-Path $ScriptDir "TaskbarMonitor.sln"
            Write-Host "-> Found Taskbar Monitor folder at: $ScriptDir" -ForegroundColor Green
            break
        }
    }
}

if (!(Test-Path $slnPath)) {
    Write-Host "[ERROR] Could not find TaskbarMonitor.sln in $ScriptDir" -ForegroundColor Red
    Read-Host "Press Enter to exit..."
    exit 1
}

# 1. Search for Modern MSBuild (VS 2022 / 2019)
Write-Host "[1/4] Detecting C# Build Engine..." -ForegroundColor Yellow

$modernMsbuild = $null
$vswhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
if (Test-Path $vswhere) {
    $found = & $vswhere -latest -requires Microsoft.Component.MSBuild -find MSBuild\**\Bin\MSBuild.exe 2>$null | Select-Object -First 1
    if ($found -and (Test-Path $found)) {
        $modernMsbuild = $found
    }
}

if (!$modernMsbuild) {
    $vsCandidates = @(
        "${env:ProgramFiles}\Microsoft Visual Studio\2022\Community\MSBuild\Current\Bin\MSBuild.exe",
        "${env:ProgramFiles}\Microsoft Visual Studio\2022\Professional\MSBuild\Current\Bin\MSBuild.exe",
        "${env:ProgramFiles}\Microsoft Visual Studio\2022\Enterprise\MSBuild\Current\Bin\MSBuild.exe",
        "${env:ProgramFiles}\Microsoft Visual Studio\2022\BuildTools\MSBuild\Current\Bin\MSBuild.exe",
        "${env:ProgramFiles(x86)}\Microsoft Visual Studio\2019\Community\MSBuild\Current\Bin\MSBuild.exe",
        "${env:ProgramFiles(x86)}\Microsoft Visual Studio\2019\BuildTools\MSBuild\Current\Bin\MSBuild.exe"
    )
    foreach ($cand in $vsCandidates) {
        if (Test-Path $cand) {
            $modernMsbuild = $cand
            break
        }
    }
}

# 2. Download NuGet and Dependencies
Write-Host ""
Write-Host "[2/4] Restoring Dependencies & Roslyn Modern Compiler..." -ForegroundColor Yellow
$nugetPath = Join-Path $ScriptDir "nuget.exe"
if (!(Test-Path $nugetPath)) {
    Write-Host "  -> Downloading official nuget.exe..." -ForegroundColor Gray
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri "https://dist.nuget.org/win-x86-commandline/latest/nuget.exe" -OutFile $nugetPath -UseBasicParsing
}

$packagesDir = Join-Path $ScriptDir "packages"
if (!(Test-Path $packagesDir)) { New-Item -ItemType Directory -Path $packagesDir -Force | Out-Null }

Write-Host "  -> Downloading Newtonsoft.Json & Microsoft.Net.Compilers..." -ForegroundColor Gray
& $nugetPath install Newtonsoft.Json -Version 13.0.1 -OutputDirectory $packagesDir | Out-Null
& $nugetPath install Microsoft.Net.Compilers -Version 2.10.0 -OutputDirectory $packagesDir | Out-Null

$jsonDll = Join-Path $packagesDir "Newtonsoft.Json.13.0.1\lib\net45\Newtonsoft.Json.dll"
$cscExe = Join-Path $packagesDir "Microsoft.Net.Compilers.2.10.0\tools\csc.exe"

# 3. Compile Solution
Write-Host ""
Write-Host "[3/4] Compiling Taskbar Monitor (64-bit Release)..." -ForegroundColor Yellow

$tmOutDir = Join-Path $ScriptDir "TaskbarMonitor\bin\Release"
$w11OutDir = Join-Path $ScriptDir "TaskbarMonitorWindows11\bin\Release"
if (!(Test-Path $tmOutDir)) { New-Item -ItemType Directory -Path $tmOutDir -Force | Out-Null }
if (!(Test-Path $w11OutDir)) { New-Item -ItemType Directory -Path $w11OutDir -Force | Out-Null }

$tmDll = Join-Path $tmOutDir "TaskbarMonitor.dll"
$w11Exe = Join-Path $w11OutDir "TaskbarMonitorWindows11.exe"

if ($modernMsbuild) {
    Write-Host "  -> Using Modern Visual Studio MSBuild: $modernMsbuild" -ForegroundColor Green
    & $modernMsbuild (Join-Path $ScriptDir "TaskbarMonitor\TaskbarMonitor.csproj") /t:Rebuild /p:Configuration=Release /p:Platform="AnyCPU" /m /v:m
    & $modernMsbuild (Join-Path $ScriptDir "TaskbarMonitorWindows11\TaskbarMonitorWindows11.csproj") /t:Rebuild /p:Configuration=Release /p:Platform="AnyCPU" /m /v:m
} else {
    Write-Host "  -> Using Standalone Roslyn Compiler ($cscExe)..." -ForegroundColor Green

    # Helper function to compile .resx to .resources directly via .NET
    Add-Type -AssemblyName System.Windows.Forms
    function Convert-Resx($inPath, $outPath) {
        if (Test-Path $inPath) {
            $reader = New-Object System.Resources.ResXResourceReader($inPath)
            $writer = New-Object System.Resources.ResourceWriter($outPath)
            foreach ($item in $reader) {
                $writer.AddResource($item.Key, $item.Value)
            }
            $reader.Close()
            $writer.Generate()
            $writer.Close()
        }
    }

    Write-Host "  -> Compiling Form & UI Resources..." -ForegroundColor Gray
    Convert-Resx (Join-Path $ScriptDir "TaskbarMonitor\OptionForm.resx") (Join-Path $tmOutDir "TaskbarMonitor.OptionForm.resources")
    Convert-Resx (Join-Path $ScriptDir "TaskbarMonitor\Properties\Resources.resx") (Join-Path $tmOutDir "TaskbarMonitor.Properties.Resources.resources")
    Convert-Resx (Join-Path $ScriptDir "TaskbarMonitor\ScreenPositioning.resx") (Join-Path $tmOutDir "TaskbarMonitor.ScreenPositioning.resources")
    Convert-Resx (Join-Path $ScriptDir "TaskbarMonitor\SystemWatcherControl.resx") (Join-Path $tmOutDir "TaskbarMonitor.SystemWatcherControl.resources")
    Convert-Resx (Join-Path $ScriptDir "TaskbarMonitorWindows11\Properties\Resources.resx") (Join-Path $w11OutDir "TaskbarMonitorWindows11.Properties.Resources.resources")
    Convert-Resx (Join-Path $ScriptDir "TaskbarMonitorWindows11\ReportErrorForm.resx") (Join-Path $w11OutDir "TaskbarMonitorWindows11.ReportErrorForm.resources")

    Write-Host "  -> Compiling TaskbarMonitor.dll..." -ForegroundColor Gray
    $tmSources = Get-ChildItem -Path (Join-Path $ScriptDir "TaskbarMonitor") -Filter "*.cs" -Recurse | Select-Object -ExpandProperty FullName
    
    $resourceArgs = @()
    if (Test-Path (Join-Path $tmOutDir "TaskbarMonitor.OptionForm.resources")) { $resourceArgs += "/resource:$tmOutDir\TaskbarMonitor.OptionForm.resources,TaskbarMonitor.OptionForm.resources" }
    if (Test-Path (Join-Path $tmOutDir "TaskbarMonitor.Properties.Resources.resources")) { $resourceArgs += "/resource:$tmOutDir\TaskbarMonitor.Properties.Resources.resources,TaskbarMonitor.Properties.Resources.resources" }
    if (Test-Path (Join-Path $tmOutDir "TaskbarMonitor.ScreenPositioning.resources")) { $resourceArgs += "/resource:$tmOutDir\TaskbarMonitor.ScreenPositioning.resources,TaskbarMonitor.ScreenPositioning.resources" }
    if (Test-Path (Join-Path $tmOutDir "TaskbarMonitor.SystemWatcherControl.resources")) { $resourceArgs += "/resource:$tmOutDir\TaskbarMonitor.SystemWatcherControl.resources,TaskbarMonitor.SystemWatcherControl.resources" }

    $tmArgs = @(
        "/target:library",
        "/out:$tmDll",
        "/platform:x64",
        "/optimize+",
        "/define:TRACE;DESKBAND_WINFORMS",
        "/r:System.dll",
        "/r:System.Core.dll",
        "/r:System.Drawing.dll",
        "/r:System.Windows.Forms.dll",
        "/r:System.Web.Extensions.dll",
        "/r:System.Data.dll",
        "/r:System.Xml.dll",
        "/r:System.Xml.Linq.dll",
        "/r:System.Data.DataSetExtensions.dll",
        "/r:Microsoft.CSharp.dll",
        "/r:System.Configuration.dll",
        "/r:System.Deployment.dll",
        "/r:$jsonDll"
    ) + $resourceArgs + $tmSources

    & $cscExe $tmArgs
    if ($LASTEXITCODE -ne 0 -or !(Test-Path $tmDll)) {
        Write-Host "[ERROR] Failed to compile TaskbarMonitor.dll" -ForegroundColor Red
        Read-Host "Press Enter to exit..."
        exit 1
    }

    Write-Host "  -> Compiling TaskbarMonitorWindows11.exe..." -ForegroundColor Gray
    $w11Sources = Get-ChildItem -Path (Join-Path $ScriptDir "TaskbarMonitorWindows11") -Filter "*.cs" -Recurse | Select-Object -ExpandProperty FullName
    
    $w11ResArgs = @()
    if (Test-Path (Join-Path $w11OutDir "TaskbarMonitorWindows11.Properties.Resources.resources")) { $w11ResArgs += "/resource:$w11OutDir\TaskbarMonitorWindows11.Properties.Resources.resources,TaskbarMonitorWindows11.Properties.Resources.resources" }
    if (Test-Path (Join-Path $w11OutDir "TaskbarMonitorWindows11.ReportErrorForm.resources")) { $w11ResArgs += "/resource:$w11OutDir\TaskbarMonitorWindows11.ReportErrorForm.resources,TaskbarMonitorWindows11.ReportErrorForm.resources" }

    $iconPath = Join-Path $ScriptDir "TaskbarMonitorWindows11\icon.ico"
    $manifestPath = Join-Path $ScriptDir "TaskbarMonitorWindows11\app.manifest"

    $w11Args = @(
        "/target:winexe",
        "/out:$w11Exe",
        "/platform:x64",
        "/optimize+",
        "/define:TRACE",
        "/r:System.dll",
        "/r:System.Core.dll",
        "/r:System.Drawing.dll",
        "/r:System.Windows.Forms.dll",
        "/r:System.Data.dll",
        "/r:System.Xml.dll",
        "/r:System.Xml.Linq.dll",
        "/r:System.Data.DataSetExtensions.dll",
        "/r:Microsoft.CSharp.dll",
        "/r:System.Deployment.dll",
        "/r:$jsonDll",
        "/r:$tmDll"
    )
    if (Test-Path $iconPath) { $w11Args += "/win32icon:$iconPath" }
    if (Test-Path $manifestPath) { $w11Args += "/win32manifest:$manifestPath" }
    $w11Args += $w11ResArgs + $w11Sources

    & $cscExe $w11Args
    if ($LASTEXITCODE -ne 0 -or !(Test-Path $w11Exe)) {
        Write-Host "[ERROR] Failed to compile TaskbarMonitorWindows11.exe" -ForegroundColor Red
        Read-Host "Press Enter to exit..."
        exit 1
    }
}

# 4. Prepare Output Folder
Write-Host ""
Write-Host "[4/4] Packaging Release Files..." -ForegroundColor Yellow

$distFolder = Join-Path $ScriptDir "TaskbarMonitor_Release"
if (!(Test-Path $distFolder)) { New-Item -ItemType Directory -Path $distFolder -Force | Out-Null }

Copy-Item -Path $w11Exe -Destination $distFolder -Force
Copy-Item -Path $tmDll -Destination $distFolder -Force
if (Test-Path $jsonDll) {
    Copy-Item -Path $jsonDll -Destination $distFolder -Force
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "   BUILD SUCCESSFUL!                                      " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Executable created in:" -ForegroundColor White
Write-Host "  $distFolder\TaskbarMonitorWindows11.exe" -ForegroundColor Cyan
Write-Host ""

# Ask to launch
$runNow = Read-Host "Do you want to run Taskbar Monitor right now? (Y/N)"
if ($runNow -eq 'Y' -or $runNow -eq 'y') {
    Start-Process (Join-Path $distFolder "TaskbarMonitorWindows11.exe")
    Write-Host "Taskbar Monitor launched! Check your Windows taskbar beside the clock." -ForegroundColor Green
}

# Ask to add to Startup
$startup = Read-Host "Do you want it to run automatically on Windows startup? (Y/N)"
if ($startup -eq 'Y' -or $startup -eq 'y') {
    $startupFolder = [System.Environment]::GetFolderPath('Startup')
    $shortcutPath = Join-Path $startupFolder "TaskbarMonitorWindows11.lnk"
    $wscript = New-Object -ComObject WScript.Shell
    $shortcut = $wscript.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = (Join-Path $distFolder "TaskbarMonitorWindows11.exe")
    $shortcut.WorkingDirectory = $distFolder
    $shortcut.Save()
    Write-Host "Added to Startup folder: $shortcutPath" -ForegroundColor Green
}

Write-Host ""
Write-Host "All done! Press Enter to close this window." -ForegroundColor Gray
Read-Host
