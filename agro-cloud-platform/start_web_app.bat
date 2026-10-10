@echo off
echo ===================================================
echo Starting Krishi Setu Web Application
echo Web app will open at: http://localhost:8081
echo ===================================================
cd /d "%~dp0\mobile-app"
npx expo start --web
pause
