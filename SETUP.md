# ⚡ Agro-Cloud 5-Minute Setup & Execution Guide

Follow these copy-paste commands to launch the complete **Agro-Cloud Platform** (Backend API, AI Microservice, Mobile Web Preview, Database Seed) on any laptop in under 5 minutes.

---

## 📋 Prerequisites
- **Python 3.10+**
- **Node.js 18+** & `npm`
- **Git**

---

## 🚀 Option 1: Quick-Start Local Launch (Recommended for Demo)

Open 3 terminal windows in your project directory: `agro-cloud-platform/`.

### Terminal 1: AI & ML Engine (Port 8500)
```bash
cd agro-cloud-platform/ai-engine

# 1. Create and activate Python virtual environment
python -m venv .venv
# On Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# On macOS/Linux:
# source .venv/bin/activate

# 2. Install AI Engine dependencies
pip install -r requirements.txt

# 3. Start AI Engine FastAPI server on Port 8500
python -m uvicorn app.main:app --host 127.0.0.1 --port 8500
```
*Verify AI Engine health*: Open `http://127.0.0.1:8500/health` in your browser.

---

### Terminal 2: Agro-Cloud Backend API & Database Seed (Port 8080)
```bash
cd agro-cloud-platform/backend

# 1. Create and activate Python virtual environment
python -m venv .venv
# On Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# On macOS/Linux:
# source .venv/bin/activate

# 2. Install Backend dependencies
pip install -r requirements.txt

# 3. Seed Database with 240 telemetry readings, Mandi prices & Trade listings
python seed.py

# 4. Start Backend FastAPI server on Port 8080
python -m uvicorn app.main:app --host 127.0.0.1 --port 8080
```
*Verify Backend API*: Open `http://127.0.0.1:8080/docs` in your browser.

---

### Terminal 3: Multilingual Mobile App (Expo Web / Expo Go)
```bash
cd agro-cloud-platform/mobile-app

# 1. Install Node.js dependencies
npm install

# 2. Start Expo Web Preview on Port 8082
npx expo export --platform web
python -m http.server 8082 --directory dist
```
*Open Mobile App Preview*: Open `http://localhost:8082` in your browser!

---

## 🐳 Option 2: Docker Compose Single-Command Launch

If Docker Desktop is installed, start all microservices and PostgreSQL with one command:

```bash
docker-compose up --build
```
- **Backend API**: `http://localhost:8000/docs`
- **AI Microservice**: `http://localhost:8500/docs`
- **PostgreSQL**: `localhost:5432`

---

## 🧪 Verification & Automated Testing

To run the automated end-to-end integration test suite verifying telemetry ingestion, AI disease diagnosis, yield forecasting, 14-day price forecasting, smart buyer matching, and logistics provisioning:

```bash
cd agro-cloud-platform/backend
python test_e2e_integration.py
python test_farm_to_market_flow.py
```
Both test scripts should exit with code `0` and print full JSON responses.
