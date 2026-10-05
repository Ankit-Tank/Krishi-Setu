<div align="center">
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:C1502E,100:2B3A67&height=220&section=header&text=Krishi%20Setu&fontSize=72&fontColor=F7F1E8&fontAlignY=38&animation=fadeIn&desc=Cloud-Native%20Agri-Advisory%20%26%20Market%20Linkage%20Ecosystem&descAlignY=58&descSize=19&descColor=F7F1E8" width="100%" alt="Krishi Setu banner"/>
<br/>
[![Typing SVG](https://readme-typing-svg.demolab.com/?font=Georgia&weight=600&size=22&pause=1200&color=C1502E&center=true&vCenter=true&width=720&lines=Diagnose+crop+disease+from+a+photo+in+under+2+seconds;Forecast+mandi+prices+for+the+next+14+days;Match+farmers+to+the+best+buyer+and+the+best+mandi;Built+for+Smart+India+Hackathon+2026)](https://git.io/typing-svg)
 
<br/>
<img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
<img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
<img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native"/>
<img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
<img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
<br/>
<img src="https://img.shields.io/badge/Status-Hackathon%20Build-E8A63A?style=for-the-badge" alt="Status"/>
<img src="https://img.shields.io/badge/SIH-2026-C1502E?style=for-the-badge" alt="SIH 2026"/>
<img src="https://img.shields.io/badge/License-MIT-2B3A67?style=for-the-badge" alt="License"/>
<br/><br/>
 
<a href="#-the-problem"><img src="https://img.shields.io/badge/-The%20Problem-2E2A26?style=flat-square" /></a>
<a href="#-features"><img src="https://img.shields.io/badge/-Features-2E2A26?style=flat-square" /></a>
<a href="#-architecture"><img src="https://img.shields.io/badge/-Architecture-2E2A26?style=flat-square" /></a>
<a href="#-tech-stack"><img src="https://img.shields.io/badge/-Tech%20Stack-2E2A26?style=flat-square" /></a>
<a href="#-quick-start"><img src="https://img.shields.io/badge/-Quick%20Start-2E2A26?style=flat-square" /></a>
<a href="#-project-structure"><img src="https://img.shields.io/badge/-Structure-2E2A26?style=flat-square" /></a>
<a href="#-testing"><img src="https://img.shields.io/badge/-Testing-2E2A26?style=flat-square" /></a>
<a href="#-roadmap"><img src="https://img.shields.io/badge/-Roadmap-2E2A26?style=flat-square" /></a>
 
</div>
<br/>
<a name="-the-problem"></a>
## 🌾 The Problem
 
> A farmer in a small village photographs a diseased leaf with no one to ask. Weeks later, the same farmer sells a healthy harvest at a crashed price — because nobody told them the next village's mandi was paying 20% more.
 
Smallholder farmers live between two broken worlds:
 
| | |
|---|---|
| 🩺 **Field-level blindness** | Pest and disease outbreaks go undiagnosed until it's too late. Soil health decisions are guesswork. |
| 📉 **Post-harvest distress selling** | No visibility into regional mandi prices means farmers sell wherever's closest — rarely wherever's best. |
 
**Krishi Setu** exists to close that gap — one AI-powered platform, from the leaf to the ledger.
 
<br/>
<a name="-features"></a>
## ✨ Features
 
<table>
<tr>
<td width="33%" valign="top">
### 🔬 AI Disease Diagnosis
Photograph a leaf, get a diagnosis and treatment advisory in under 2 seconds — powered by a fine-tuned CNN served as an independent microservice.
 
</td>
<td width="33%" valign="top">
### 🌱 Soil & Irrigation Advisory
Submit soil telemetry (N-P-K, pH, moisture) and receive a health score with deficiency-specific, actionable recommendations.
 
</td>
<td width="33%" valign="top">
### 📈 14-Day Price Forecasting
Time-series forecasting over historical mandi data projects prices two weeks out — with confidence intervals, not false precision.
 
</td>
</tr>
<tr>
<td width="33%" valign="top">
### 🤝 Smart Buyer Matching
Ranks nearby mandis and buyers by predicted price and distance, turning a forecast into a concrete "sell here, sell now" recommendation.
 
</td>
<td width="33%" valign="top">
### 🚚 Logistics Provisioning
Connects a farmer's harvest schedule directly to transport and trade listings — closing the loop from diagnosis to doorstep.
 
</td>
<td width="33%" valign="top">
### 🌐 Offline-First Multilingual App
A React Native experience that caches locally and syncs when connectivity returns — built for rural networks, not boardroom Wi-Fi.
 
</td>
</tr>
</table>
<br/>
<a name="-architecture"></a>
## 🏗️ Architecture
 
The AI engine runs as its **own independently deployable microservice** — separate from the core backend — so diagnosis, forecasting, and advisory models can scale independently of farmer traffic and profile data.
 
```mermaid
flowchart TD
    A["📱 Mobile App — React Native / Expo"] -->|REST| B["🧠 Backend API — FastAPI :8000"]
    B -->|REST| C["🤖 AI Microservice — FastAPI :8500"]
    C --> D["Disease CNN"]
    C --> E["Soil Model"]
    C --> F["Price Forecaster"]
    B --> G[("🗄️ PostgreSQL")]
    B --> H["📦 Seed Data — telemetry, mandi prices, trade listings"]
 
    style A fill:#2B3A67,color:#fff,stroke:none
    style B fill:#C1502E,color:#fff,stroke:none
    style C fill:#C1502E,color:#fff,stroke:none
    style D fill:#E8A63A,color:#2E2A26,stroke:none
    style E fill:#E8A63A,color:#2E2A26,stroke:none
    style F fill:#E8A63A,color:#2E2A26,stroke:none
    style G fill:#2B3A67,color:#fff,stroke:none
    style H fill:#F7F1E8,color:#2E2A26,stroke:#2E2A26
```
 
<br/>
<a name="-tech-stack"></a>
## 🛠️ Tech Stack
 
<div align="center">
| Layer | Technology |
|---|---|
| **Mobile App** | ![React Native](https://img.shields.io/badge/-React%20Native-61DAFB?style=flat-square&logo=react&logoColor=black) ![Expo](https://img.shields.io/badge/-Expo-000020?style=flat-square&logo=expo&logoColor=white) |
| **Backend API** | ![FastAPI](https://img.shields.io/badge/-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white) ![SQLAlchemy](https://img.shields.io/badge/-SQLAlchemy-D71F00?style=flat-square) |
| **AI Microservice** | ![PyTorch](https://img.shields.io/badge/-PyTorch-EE4C2C?style=flat-square&logo=pytorch&logoColor=white) ![ONNX](https://img.shields.io/badge/-ONNX-005CED?style=flat-square) ![scikit--learn](https://img.shields.io/badge/-scikit--learn-F7931E?style=flat-square&logo=scikit-learn&logoColor=white) ![Prophet](https://img.shields.io/badge/-Prophet-3366CC?style=flat-square) |
| **Database** | ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white) |
| **Infra** | ![Docker](https://img.shields.io/badge/-Docker-2496ED?style=flat-square&logo=docker&logoColor=white) ![Docker Compose](https://img.shields.io/badge/-Docker%20Compose-2496ED?style=flat-square&logo=docker&logoColor=white) |
 
</div>
<br/>
<a name="-project-structure"></a>
## 📂 Project Structure
 
```
agro-cloud-platform/
├── backend/              → FastAPI core API · auth · database · orchestration
├── ai-engine/             → Independent AI microservice (disease, soil, forecast models)
├── mobile-app/           → React Native (Expo) farmer-facing app
├── docs/                   → Architecture notes, diagrams, pitch material
├── seed-data/              → Mock telemetry, mandi prices, sample listings
└── docker-compose.yml      → One-command full-stack launch
```
 
<br/>
<a name="-quick-start"></a>
## 🚀 Quick Start
 
### Prerequisites
 
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)
![Git](https://img.shields.io/badge/Git-latest-F05032?style=flat-square&logo=git&logoColor=white)
 
<br/>
<details>
<summary><b>🐳 Option 1 — Docker Compose (single command, recommended)</b></summary>
<br/>
```bash
docker-compose up --build
```
 
| Service | URL |
|---|---|
| Backend API docs | `http://localhost:8000/docs` |
| AI Microservice docs | `http://localhost:8500/docs` |
| PostgreSQL | `localhost:5432` |
 
</details>
<details>
<summary><b>⚡ Option 2 — Manual local launch (3 terminals, ~5 minutes)</b></summary>
<br/>
**Terminal 1 — AI & ML Engine (port 8500)**
```bash
cd agro-cloud-platform/ai-engine
python -m venv .venv && .venv\Scripts\Activate.ps1   # Windows
# source .venv/bin/activate                            # macOS/Linux
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8500
```
Verify → `http://localhost:8500/health`
 
**Terminal 2 — Backend API + Database Seed (port 8000)**
```bash
cd agro-cloud-platform/backend
python -m venv .venv && .venv\Scripts\Activate.ps1
pip install -r requirements.txt
python seed.py          # seeds telemetry, mandi prices, trade listings
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Verify → `http://localhost:8000/docs`
 
**Terminal 3 — Mobile App (Expo Web preview, port 8082)**
```bash
cd agro-cloud-platform/mobile-app
npm install
npx expo export --platform web
python -m http.server 8082 --directory dist
```
Open → `http://localhost:8082`
 
</details>
<br/>
<a name="-testing"></a>
## 🧪 Testing
 
End-to-end integration tests verify the full pipeline — telemetry ingestion → AI diagnosis → yield forecasting → price forecasting → buyer matching → logistics provisioning:
 
```bash
cd agro-cloud-platform/backend
python test_e2e_integration.py
python test_farm_to_market_flow.py
```
 
Both should exit with status `0` and print full JSON responses.
 
<br/>
<a name="-roadmap"></a>
## 🗺️ Roadmap
 
- [x] Disease diagnosis microservice
- [x] Soil health advisory engine
- [x] 14-day mandi price forecasting
- [x] Smart buyer/mandi matching
- [ ] Voice input & text-to-speech advisory playback
- [ ] WhatsApp bot interface
- [ ] Live IoT soil sensor integration
- [ ] Multi-region, multi-crop scale-out
<br/>
## 🤝 Contributing
 
Contributions, issues, and feature requests are welcome.
 
```bash
# 1. Fork the repo
# 2. Create your feature branch
git checkout -b feature/amazing-feature
# 3. Commit your changes
git commit -m "Add amazing feature"
# 4. Push and open a Pull Request
git push origin feature/amazing-feature
```
 
<br/>
<div align="center">
### Built for Smart India Hackathon 2026
 
<img src="https://img.shields.io/badge/Made%20with-%E2%9D%A4-C1502E?style=for-the-badge" alt="Made with love"/>
<br/><br/>
 
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:2B3A67,100:C1502E&height=120&section=footer" width="100%"/>
</div>