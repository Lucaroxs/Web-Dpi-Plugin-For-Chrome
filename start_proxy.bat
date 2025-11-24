@echo off
title DPI Bypass Proxy Server
cd /d "%~dp0"

:: Kill any existing process on port 8080
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8080" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

:: Create a custom named executable for Task Manager visibility
if not exist "Proxy Stable.exe" (
    for %%X in (node.exe) do (set FOUND=%%~$PATH:X)
    if defined FOUND (
        copy /y "%FOUND%" "Proxy Stable.exe" >nul
    ) else (
        echo Node.js not found in PATH. Please install Node.js.
        pause
        exit
    )
)

"Proxy Stable.exe" local_proxy/proxy.js
