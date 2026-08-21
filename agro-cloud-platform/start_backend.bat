@echo off
echo ===================================================
echo Starting Agro-Cloud Platform Backend API on 0.0.0.0:8000
echo ===================================================
cd /d "%~dp0\backend"
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
