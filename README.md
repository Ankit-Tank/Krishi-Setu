# Agro-Cloud: Cloud-Native Agri-Advisory & Market Linkage Ecosystem

> Hackathon Project Monorepo

## Problem Statement
Develop an end-to-end Agro-Cloud platform paired with a multilingual mobile application. The system ingests on-field crop imagery, microclimate data, and soil telemetry to provide real-time AI disease diagnosis and NPK/irrigation recommendations, while aggregating regional mandi market trends and forecasting crop yield windows to connect farmers directly with optimal buyers and logistics channels.

---

## Monorepo Folder Structure

```
agro-cloud-platform/
├── backend/              (FastAPI Python backend)
├── ai-engine/            (Python AI/ML services: disease detection, advisory, forecasting)
├── mobile-app/           (React Native Expo app)
├── docs/                 (architecture diagram markdown, README, pitch notes)
└── seed-data/            (mock telemetry, mandi price data, sample leaf images references)
```

## Quick Start

```bash
# Spin up backend, ai-engine, and postgres:
docker compose up -d

# Run mobile app in another terminal:
cd agro-cloud-platform/mobile-app
npm start
```
