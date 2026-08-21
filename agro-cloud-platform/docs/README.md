# Agro-Cloud: Cloud-Native Agri-Advisory & Market Linkage Ecosystem

## Project Overview

Develop an end-to-end Agro-Cloud platform paired with a multilingual mobile application. The system ingests on-field crop imagery, microclimate data, and soil telemetry to provide real-time AI disease diagnosis and NPK/irrigation recommendations, while aggregating regional mandi market trends and forecasting crop yield windows to connect farmers directly with optimal buyers and logistics channels.

---

## System Components

1. **`backend/` (FastAPI Cloud Platform)**
   - High-throughput REST API for IoT telemetry ingestion, farm profile management, soil health analytics, and mandi market indexing.
   - Powered by PostgreSQL and SQLAlchemy with async database connectivity.
   - Integrates seamlessly with the AI microservice engine.

2. **`ai-engine/` (Python AI/ML Microservices)**
   - **Crop Disease Diagnosis**: Computer vision models for leaf symptom detection, severity scoring, and organic/chemical cure recommendations.
   - **Smart Agronomic Advisory**: NPK fertilizer balancing algorithm and precision irrigation scheduling based on real-time soil telemetry and weather conditions.
   - **Market & Yield Forecasting**: Time-series predictive models for regional mandi price fluctuations and harvest window estimation.

3. **`mobile-app/` (React Native Expo Mobile Application)**
   - Built with TypeScript and **Expo Router**.
   - Accessible UI using **React Native Paper** with high-contrast agriculture theme.
   - Multilingual support via **i18next** (English, Hindi, Telugu, Marathi, Kannada).
   - Offline-first caching powered by `@react-native-async-storage/async-storage`.

4. **`seed-data/` (Simulated Datasets)**
   - IoT soil telemetry stream datasets (Moisture, Nitrogen, Phosphorus, Potassium, Temperature, Humidity, pH).
   - Real-time regional APMC Mandi commodity rates across Indian agricultural hubs.
   - Plant disease diagnostic knowledge base and leaf symptom taxonomy.

5. **`docs/` (Architecture & Hackathon Resources)**
   - Detailed architecture diagrams, cloud topology, data pipelines, and pitch deck notes.

---

## Quickstart & Local Development

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- Docker & Docker Compose (optional for containerized orchestration)

### Running with Docker Compose
```bash
# From the root directory:
docker compose up --build
```
- **Backend API**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **AI Engine API**: [http://localhost:8001/docs](http://localhost:8001/docs)
- **PostgreSQL**: `localhost:5432` (`agro_cloud_db`)

### Running Services Locally

#### 1. Backend Service
```bash
cd agro-cloud-platform/backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### 2. AI Engine Service
```bash
cd agro-cloud-platform/ai-engine
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

#### 3. Mobile App
```bash
cd agro-cloud-platform/mobile-app
npm install
npx expo start
```
