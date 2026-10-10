@echo off
echo ===================================================
echo Starting Krishi Setu Mobile App with LAN Host for Expo Go (SDK 57)
echo Binding to LAN IP: 192.168.1.9 (Port: 8081)
echo.
echo 1. Ensure your phone is connected to the same Wi-Fi network.
echo 2. Open the Expo Go app on your Android/iOS phone and scan the QR code.
echo ===================================================
cd /d "%~dp0\mobile-app"
set REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.9
npx expo start --go --host lan
pause
