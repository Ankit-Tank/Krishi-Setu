@echo off
echo ===================================================
echo Starting Agro-Cloud Platform AI Engine on 0.0.0.0:8500
echo ===================================================
cd /d "%~dp0\ai-engine"
python -m uvicorn app.main:app --host 0.0.0.0 --port 8500 --reload
pause
