@echo off
title DPI Bypass Proxy Server
cd /d "%~dp0"
echo Proxy baslatiliyor...
echo Lutfen bu pencereyi kapatmayin.
node local_proxy/proxy.js
pause
