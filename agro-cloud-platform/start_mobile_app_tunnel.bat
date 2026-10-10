@echo off
echo ===================================================
echo Starting Krishi Setu Mobile App with Public Tunnel
echo.
echo Use this mode if your phone is on cellular data (4G/5G)
echo or if your Wi-Fi router isolates devices (AP Isolation).
echo ===================================================
cd /d "%~dp0\mobile-app"
npx expo start --go --tunnel
pause
