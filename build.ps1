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
    # Check if project folder is inside a subfolder on Desktop or Downloads
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

# If still not found, prompt the user
if (!(Test-Path $slnPath)) {
    Write-Host ""
    Write-Host "[!] TaskbarMonitor.sln was not found directly in: $ScriptDir" -ForegroundColor Yellow
    Write-Host "    This happens when build.ps1 is run separately from the project files." -ForegroundColor Gray
    Write-Host ""
    Write-Host "Please enter the path to the folder where you extracted the project:" -ForegroundColor White
    $entered = Read-Host "Folder Path (or drag and drop the folder here)"
    if ($entered) {
        $cleanPath = $entered.Trim("'`"")
        if (Test-Path (Join-Path $cleanPath "TaskbarMonitor.sln")) {
            $ScriptDir = $cleanPath
            $slnPath = Join-Path $ScriptDir "TaskbarMonitor.sln"
        }
    }
}

if (!(Test-Path $slnPath)) {
    Write-Host ""
    Write-Host "[ERROR] Could not find TaskbarMonitor.sln." -ForegroundColor Red
    Write-Host "Make sure you extract the entire zip folder and run build.ps1 INSIDE that folder." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit..."
    exit 1
}

# 1. Search for MSBuild
Write-Host "[1/4] Searching for C# / MSBuild Compiler..." -ForegroundColor Yellow

$msbuildPaths = @(
    "${env:ProgramFiles}\Microsoft Visual Studio\2022\Community\MSBuild\Current\Bin\MSBuild.exe",
    "${env:ProgramFiles}\Microsoft Visual Studio\2022\Professional\MSBuild\Current\Bin\MSBuild.exe",
    "${env:ProgramFiles}\Microsoft Visual Studio\2022\Enterprise\MSBuild\Current\Bin\MSBuild.exe",
    "${env:ProgramFiles}\Microsoft Visual Studio\2022\BuildTools\MSBuild\Current\Bin\MSBuild.exe",
    "${env:ProgramFiles(x86)}\Microsoft Visual Studio\2019\Community\MSBuild\Current\Bin\MSBuild.exe",
    "${env:ProgramFiles(x86)}\Microsoft Visual Studio\2019\Professional\MSBuild\Current\Bin\MSBuild.exe",
    "${env:ProgramFiles(x86)}\Microsoft Visual Studio\2019\Enterprise\MSBuild\Current\Bin\MSBuild.exe",
    "${env:ProgramFiles(x86)}\Microsoft Visual Studio\2019\BuildTools\MSBuild\Current\Bin\MSBuild.exe",
    "${env:SystemRoot}\Microsoft.NET\Framework64\v4.0.30319\MSBuild.exe"
)

# Also check vswhere if present
$vswhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
if (Test-Path $vswhere) {
    $found = & $vswhere -latest -requires Microsoft.Component.MSBuild -find MSBuild\**\Bin\MSBuild.exe 2>$null | Select-Object -First 1
    if ($found -and (Test-Path $found)) {
        $msbuildPaths = @($found) + $msbuildPaths
    }
}

$msbuild = $null
foreach ($path in $msbuildPaths) {
    if ($path -and (Test-Path $path)) {
        $msbuild = $path
        break
    }
}

if (!$msbuild) {
    Write-Host ""
    Write-Host "[!] MSBuild / Visual Studio Compiler was not found on your system." -ForegroundColor Red
    Write-Host ""
    Write-Host "To compile this Windows desktop app on your machine, you need" -ForegroundColor White
    Write-Host "Visual Studio (Free Community Edition) or the standalone Build Tools." -ForegroundColor White
    Write-Host ""
    $openVs = Read-Host "Would you like to open the official Visual Studio Community download page now? (Y/N)"
    if ($openVs -eq 'Y' -or $openVs -eq 'y') {
        Start-Process "https://visualstudio.microsoft.com/vs/community/"
    }
    Write-Host ""
    Write-Host "Press Enter to exit..." -ForegroundColor Gray
    Read-Host
    exit 1
}

Write-Host "  -> Found MSBuild: $msbuild" -ForegroundColor Green

# 2. Restore NuGet Packages
Write-Host ""
Write-Host "[2/4] Checking NuGet Dependencies..." -ForegroundColor Yellow
$nugetPath = Join-Path $ScriptDir "nuget.exe"
if (!(Test-Path $nugetPath)) {
    Write-Host "  -> Downloading official nuget.exe..." -ForegroundColor Gray
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri "https://dist.nuget.org/win-x86-commandline/latest/nuget.exe" -OutFile $nugetPath -UseBasicParsing
}

Write-Host "  -> Restoring packages..." -ForegroundColor Gray
& $nugetPath restore $slnPath | Out-Null

# 3. Compile Solution
Write-Host ""
Write-Host "[3/4] Compiling Taskbar Monitor in Release mode..." -ForegroundColor Yellow

$taskbarCsproj = Join-Path $ScriptDir "TaskbarMonitor\TaskbarMonitor.csproj"
$win11Csproj = Join-Path $ScriptDir "TaskbarMonitorWindows11\TaskbarMonitorWindows11.csproj"

& $msbuild $taskbarCsproj /t:Rebuild /p:Configuration=Release /p:Platform="AnyCPU" /m /v:m
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to compile TaskbarMonitor.dll" -ForegroundColor Red
    Read-Host "Press Enter to exit..."
    exit 1
}

& $msbuild $win11Csproj /t:Rebuild /p:Configuration=Release /p:Platform="AnyCPU" /m /v:m
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to compile TaskbarMonitorWindows11.exe" -ForegroundColor Red
    Read-Host "Press Enter to exit..."
    exit 1
}

# 4. Prepare Output Folder
Write-Host ""
Write-Host "[4/4] Packaging Release Files..." -ForegroundColor Yellow

$distFolder = Join-Path $ScriptDir "TaskbarMonitor_Release"
if (!(Test-Path $distFolder)) {
    New-Item -ItemType Directory -Path $distFolder | Out-Null
}

$win11Exe = Join-Path $ScriptDir "TaskbarMonitorWindows11\bin\Release\TaskbarMonitorWindows11.exe"
$dllFile = Join-Path $ScriptDir "TaskbarMonitor\bin\Release\TaskbarMonitor.dll"
$jsonDll = Join-Path $ScriptDir "packages\Newtonsoft.Json.13.0.1\lib\net45\Newtonsoft.Json.dll"

Copy-Item -Path $win11Exe -Destination $distFolder -Force
Copy-Item -Path $dllFile -Destination $distFolder -Force
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
