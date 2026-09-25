@echo off
setlocal enabledelayedexpansion
title Taskbar Monitor - Automated Windows 11 Build & Setup

echo ========================================================
echo   Taskbar Monitor + Soundcore Battery Build System
echo ========================================================
echo.

set "MSBUILD="

rem 1. Check Visual Studio 2022 Community / Professional / Enterprise
if exist "%ProgramFiles%\Microsoft Visual Studio\2022\Community\MSBuild\Current\Bin\msbuild.exe" (
    set "MSBUILD=%ProgramFiles%\Microsoft Visual Studio\2022\Community\MSBuild\Current\Bin\msbuild.exe"
) else if exist "%ProgramFiles%\Microsoft Visual Studio\2022\Professional\MSBuild\Current\Bin\msbuild.exe" (
    set "MSBUILD=%ProgramFiles%\Microsoft Visual Studio\2022\Professional\MSBuild\Current\Bin\msbuild.exe"
) else if exist "%ProgramFiles%\Microsoft Visual Studio\2022\Enterprise\MSBuild\Current\Bin\msbuild.exe" (
    set "MSBUILD=%ProgramFiles%\Microsoft Visual Studio\2022\Enterprise\MSBuild\Current\Bin\msbuild.exe"
) else if exist "%ProgramFiles%\Microsoft Visual Studio\2022\BuildTools\MSBuild\Current\Bin\msbuild.exe" (
    set "MSBUILD=%ProgramFiles%\Microsoft Visual Studio\2022\BuildTools\MSBuild\Current\Bin\msbuild.exe"
)

rem 2. Check Visual Studio 2019
if not defined MSBUILD (
    if exist "%ProgramFiles(x86)%\Microsoft Visual Studio\2019\Community\MSBuild\Current\Bin\msbuild.exe" (
        set "MSBUILD=%ProgramFiles(x86)%\Microsoft Visual Studio\2019\Community\MSBuild\Current\Bin\msbuild.exe"
    ) else if exist "%ProgramFiles(x86)%\Microsoft Visual Studio\2019\Professional\MSBuild\Current\Bin\msbuild.exe" (
        set "MSBUILD=%ProgramFiles(x86)%\Microsoft Visual Studio\2019\Professional\MSBuild\Current\Bin\msbuild.exe"
    ) else if exist "%ProgramFiles(x86)%\Microsoft Visual Studio\2019\Enterprise\MSBuild\Current\Bin\msbuild.exe" (
        set "MSBUILD=%ProgramFiles(x86)%\Microsoft Visual Studio\2019\Enterprise\MSBuild\Current\Bin\msbuild.exe"
    ) else if exist "%ProgramFiles(x86)%\Microsoft Visual Studio\2019\BuildTools\MSBuild\Current\Bin\msbuild.exe" (
        set "MSBUILD=%ProgramFiles(x86)%\Microsoft Visual Studio\2019\BuildTools\MSBuild\Current\Bin\msbuild.exe"
    )
)

rem 3. Check .NET Framework MSBuild fallback
if not defined MSBUILD (
    if exist "%SystemRoot%\Microsoft.NET\Framework64\v4.0.30319\msbuild.exe" (
        set "MSBUILD=%SystemRoot%\Microsoft.NET\Framework64\v4.0.30319\msbuild.exe"
    ) else if exist "%SystemRoot%\Microsoft.NET\Framework\v4.0.30319\msbuild.exe" (
        set "MSBUILD=%SystemRoot%\Microsoft.NET\Framework\v4.0.30319\msbuild.exe"
    )
)

if not defined MSBUILD (
    echo [ERROR] MSBuild was not found automatically on your system.
    echo Please install Visual Studio Community (free) with the '.NET desktop development' workload,
    echo or run this script from the 'Developer Command Prompt for VS'.
    echo.
    pause
    exit /b 1
)

echo [OK] Using MSBuild: "!MSBUILD!"
echo.
echo Compiling TaskbarMonitor.sln in Release mode...
echo.

"!MSBUILD!" "%~dp0TaskbarMonitor.sln" /t:Rebuild /p:Configuration=Release /p:Platform="Any CPU" /m /v:m

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Build failed. Please review compiler error output above.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ========================================================
echo   Build Successful! Preparing files...
echo ========================================================
echo.

set "DIST=%~dp0TaskbarMonitor_Release"
if not exist "%DIST%" mkdir "%DIST%"

copy /y "%~dp0TaskbarMonitorWindows11\bin\Release\TaskbarMonitorWindows11.exe" "%DIST%\" >nul
copy /y "%~dp0TaskbarMonitor\bin\Release\TaskbarMonitor.dll" "%DIST%\" >nul
copy /y "%~dp0TaskbarMonitor\bin\Release\Newtonsoft.Json.dll" "%DIST%\" >nul

echo Files created in: "%DIST%"
echo   - TaskbarMonitorWindows11.exe (Windows 11 Taskbar App)
echo   - TaskbarMonitor.dll (CSDeskBand Component)
echo   - Newtonsoft.Json.dll
echo.

rem Ask to run now
set /p RUN_NOW="Do you want to run Taskbar Monitor now? (Y/N): "
if /i "!RUN_NOW!"=="Y" (
    echo Launching TaskbarMonitorWindows11.exe...
    start "" "%DIST%\TaskbarMonitorWindows11.exe"
)

rem Ask to add to Startup
echo.
set /p ADD_STARTUP="Do you want Taskbar Monitor to start automatically with Windows? (Y/N): "
if /i "!ADD_STARTUP!"=="Y" (
    set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
    powershell -NoProfile -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%STARTUP_FOLDER%\TaskbarMonitorWindows11.lnk'); $s.TargetPath = '%DIST%\TaskbarMonitorWindows11.exe'; $s.WorkingDirectory = '%DIST%'; $s.Save()"
    echo [OK] Added shortcut to Windows Startup folder.
)

echo.
echo Setup Complete! Enjoy your Taskbar Monitor with Soundcore battery monitoring.
pause
