@echo off
title Taskbar Monitor Setup
cd /d "%~dp0"

echo ========================================================
echo   Launching Taskbar Monitor Windows 11 Build...
echo ========================================================
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0build.ps1"

if %ERRORLEVEL% neq 0 (
    echo.
    echo ========================================================
    echo Setup ended with code %ERRORLEVEL%.
    echo ========================================================
    pause
)
