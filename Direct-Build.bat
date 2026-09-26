@echo off
title Taskbar Monitor - Direct Roslyn Builder
cd /d "%~dp0"

echo ========================================================
echo   Taskbar Monitor Direct C# Compiler (Zero MSBuild)
echo ========================================================
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; Add-Type -AssemblyName System.Windows.Forms; function Resx($i, $o) { if (Test-Path $i) { $r = New-Object System.Resources.ResXResourceReader($i); $w = New-Object System.Resources.ResourceWriter($o); foreach ($e in $r) { $w.AddResource($e.Key, $e.Value) }; $r.Close(); $w.Generate(); $w.Close() } }; $csc = Join-Path (Get-Location) 'packages\Microsoft.Net.Compilers.2.10.0\tools\csc.exe'; $json = Join-Path (Get-Location) 'packages\Newtonsoft.Json.13.0.1\lib\net45\Newtonsoft.Json.dll'; if (!(Test-Path $csc) -or !(Test-Path $json)) { Write-Host 'Downloading compiler & dependencies...'; if (!(Test-Path nuget.exe)) { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://dist.nuget.org/win-x86-commandline/latest/nuget.exe' -OutFile 'nuget.exe' -UseBasicParsing }; .\nuget.exe install Microsoft.Net.Compilers -Version 2.10.0 -OutputDirectory packages; .\nuget.exe install Newtonsoft.Json -Version 13.0.1 -OutputDirectory packages }; $outDir = Join-Path (Get-Location) 'TaskbarMonitor_Release'; New-Item -ItemType Directory -Path $outDir -Force | Out-Null; Write-Host 'Compiling UI Resources...'; Resx 'TaskbarMonitor\OptionForm.resx' (Join-Path $outDir 'TaskbarMonitor.OptionForm.resources'); Resx 'TaskbarMonitor\Properties\Resources.resx' (Join-Path $outDir 'TaskbarMonitor.Properties.Resources.resources'); Resx 'TaskbarMonitor\ScreenPositioning.resx' (Join-Path $outDir 'TaskbarMonitor.ScreenPositioning.resources'); Resx 'TaskbarMonitor\SystemWatcherControl.resx' (Join-Path $outDir 'TaskbarMonitor.SystemWatcherControl.resources'); Resx 'TaskbarMonitorWindows11\Properties\Resources.resx' (Join-Path $outDir 'TaskbarMonitorWindows11.Properties.Resources.resources'); Write-Host 'Compiling TaskbarMonitor.dll...'; $tmSrc = (Get-ChildItem -Path 'TaskbarMonitor' -Filter '*.cs' -Recurse).FullName; & $csc /t:library /out:$outDir\TaskbarMonitor.dll /platform:x64 /optimize+ /define:TRACE,DESKBAND_WINFORMS /r:System.dll,System.Core.dll,System.Drawing.dll,System.Windows.Forms.dll,System.Data.dll,System.Xml.dll,$json /resource:$outDir\TaskbarMonitor.OptionForm.resources,TaskbarMonitor.OptionForm.resources /resource:$outDir\TaskbarMonitor.Properties.Resources.resources,TaskbarMonitor.Properties.Resources.resources /resource:$outDir\TaskbarMonitor.ScreenPositioning.resources,TaskbarMonitor.ScreenPositioning.resources /resource:$outDir\TaskbarMonitor.SystemWatcherControl.resources,TaskbarMonitor.SystemWatcherControl.resources $tmSrc; Write-Host 'Compiling TaskbarMonitorWindows11.exe...'; $w11Src = (Get-ChildItem -Path 'TaskbarMonitorWindows11' -Filter '*.cs' -Recurse).FullName; & $csc /t:winexe /out:$outDir\TaskbarMonitorWindows11.exe /platform:x64 /optimize+ /define:TRACE /r:System.dll,System.Core.dll,System.Drawing.dll,System.Windows.Forms.dll,System.Data.dll,System.Xml.dll,$json,$outDir\TaskbarMonitor.dll /win32icon:TaskbarMonitorWindows11\icon.ico /resource:$outDir\TaskbarMonitorWindows11.Properties.Resources.resources,TaskbarMonitorWindows11.Properties.Resources.resources $w11Src; Copy-Item $json -Destination $outDir -Force; Write-Host 'Build Complete!' -ForegroundColor Green; Start-Process (Join-Path $outDir 'TaskbarMonitorWindows11.exe')"

if %ERRORLEVEL% neq 0 (
    echo.
    echo Compilation failed.
    pause
) else (
    echo.
    echo Taskbar Monitor launched successfully!
    timeout /t 5
)
