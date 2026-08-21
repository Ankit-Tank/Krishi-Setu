# Agro-Cloud Architecture & System Blueprint

**Project Title**: Agro-Cloud: Cloud-Native Agri-Advisory & Market Linkage Ecosystem  
**Repository Structure**: Monorepo (`backend/`, `ai-engine/`, `mobile-app/`, `docs/`, `seed-data/`)

---

## 🏗️ 1. High-Level System Architecture

```text
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │                        FARMER MULTILINGUAL MOBILE APP                        │
  │            (React Native Expo / i18next / Offline AsyncStorage Cache)        │
  └──────────────────────────────────────┬──────────────────────────────────────┘
                                         │ REST HTTP Calls / JSON
                                         ▼
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │                           AGRO-CLOUD BACKEND API                            │
  │                     (FastAPI / SQLAlchemy / PostgreSQL / SQLite)            │
  │                                                                             │
  │   - Telemetry Ingestion Router            - Advisory Persistence Router       │
  │   - Leaf Scan Router                      - Market & Trade Matching Router   │
  └────────────────═══┬──────────────────────────────────────┬────────────────══┘
                      ║ HTTP (Async httpx)                   ║ SQLAlchemy ORM
                      ▼                                      ▼
  ┌─────────────────────────────────────────┐  ┌───────────────────────────────┐
  │          AI & ML ENGINE MICROSERVICE    │  │    POSTGRESQL / SQLITE DB      │
  │            (FastAPI / Port 8001)        │  │                               │
  │                                         │  │ - Farmers & Farms             │
  │ - HuggingFace Disease Inference API     │  │ - Telemetry & Soil Readings   │
  │ - Vision Heuristic Fallback (PIL/NumPy) │  │ - LeafScans & Advisories      │
  │ - NPK & Irrigation Rule Engine          │  │ - Mandi Prices & Trends       │
  │ - Facebook Prophet Price Forecasting    │  │ - Trade Listings & Matches    │
  │ - Crop Life-Cycle Yield Engine          │  │ - Logistics Records           │
  └─────────────────────────────────────────┘  └───────────────────────────────┘
```

---

## 🔄 2. End-to-End Data Pipelines

### A. Soil & Microclimate Telemetry Ingestion Pipeline
1. IoT Field Nodes send sensor readings (`soil_moisture`, `soil_ph`, `temperature_c`, `humidity_pct`, `nitrogen_ppm`, `phosphorus_ppm`, `potassium_ppm`) to `POST /api/v1/telemetry/ingest`.
2. Backend validates telemetry payload via Pydantic schemas, persists reading in `TelemetryReading` table, and automatically triggers `AgronomicAdvisor`.
3. If soil moisture or NPK nutrients breach crop-specific agronomic thresholds, an `AdvisoryRecord` is logged and dispatched to the farmer's mobile app.

### B. Plant Pathology AI Diagnosis Pipeline
1. Farmer takes/uploads a leaf photo via `expo-image-picker` on the mobile app.
2. Mobile app sends multipart form-data to Backend `POST /api/v1/leaf-scan/upload`.
3. Backend forwards image bytes asynchronously via `httpx` to AI Engine `POST /predict/disease`.
4. AI Engine queries HuggingFace Inference API (`linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification`). If HF API is unconfigured or times out, it seamlessly falls back to a local PIL/NumPy color channel & texture variance vision heuristic.
5. Diagnosis (`disease_name`, `confidence`, `recommended_action`) is saved to `LeafScan` and logged into `AdvisoryRecord`.

### C. Farm-to-Market Buyer Matching & Logistics Pipeline
1. Farmer creates harvest sale listing via `POST /api/v1/market/trade-listing`.
2. Backend queries nearby Mandis and `MandiPrice` records, extracting `demand_urgency` (`HIGH`, `MEDIUM`, `NORMAL`).
3. `BuyerMatcher` calculates weighted score:
   $$\text{Score} = (0.5 \times \text{Offered Price}) - (2.0 \times \text{Distance in km}) + \text{Demand Urgency Boost}$$
4. Returns top 3 buyer matches with clear `"explanation"` strings.
5. Farmer accepts buyer via `POST /api/v1/market/trade-listing/{id}/confirm`.
6. System updates status to `"matched"` and provisions a `LogisticsRecord` (pickup date, transporter name, estimated transit hours).

---

## 🗄️ 3. Database Schema Overview

- **`Farmer`**: Farmer identity, phone number, language preference, region.
- **`Farm`**: Farm land parcel, GPS coordinates, acreage, active crop type.
- **`TelemetryReading`**: Time-series sensor telemetry data.
- **`LeafScan`**: Image URL, pathology diagnosis, confidence, advisory text.
- **`AdvisoryRecord`**: Farm advisory notifications (irrigation, NPK, disease).
- **`MandiPrice`**: Daily spot prices per crop and mandi with `demand_urgency`.
- **`TradeListing`**: Farmer harvest sales listing (`open` / `matched` / `closed`).
- **`BuyerMatch`**: Candidate buyer offers, mandi location, distance, score, explanation.
- **`LogisticsRecord`**: Confirmed trade dispatch schedule, transporter, transit time.
