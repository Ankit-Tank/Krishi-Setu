# 🎬 Agro-Cloud 4-Minute Hackathon Demo Script

**Target Time**: 4 Minutes  
**Presenter Flow**: Mobile App Screen + Live Backend/AI Logs

---

## ⏱️ Minute 0:00 - 0:45 | Introduction & Multilingual Dashboard
- **Script**: *"Judges, Indian agriculture faces three core challenges: disease losses, unoptimized fertilizer/water usage, and middleman exploitation. Welcome to Agro-Cloud — a cloud-native advisory and direct market linkage ecosystem."*
- **Action**:
  1. Open Mobile App on `http://localhost:8082` (or mobile device).
  2. Tap **Select Language** on top bar or Profile screen $\to$ switch between **English**, **हिंदी (Hindi)**, and **मराठी (Marathi)**. Point out instant i18next translation.
  3. Show **Dashboard Tab**: Point to live IoT Telemetry cards (**Soil Moisture 26.3%**, **Temp 24.1°C**, **Nitrogen 131ppm**, **pH 7.03**).
  4. Point out the **Offline-First Banner** (`⚡ Offline Mode — Showing last synced data`) demonstrating resilience in low-connectivity rural zones.

---

## ⏱️ Minute 0:45 - 1:45 | AI Crop Doctor Disease Diagnosis
- **Script**: *"When a farmer detects suspicious leaf discoloration, they open the Crop Doctor tab. Our multi-modal AI engine instantly classifies plant pathology using deep learning with a local computer vision fallback."*
- **Action**:
  1. Tap **Crop Doctor (Scan) Tab** in bottom navigation.
  2. Tap **Take Photo** or **Choose Gallery** button. Select/upload a leaf photo.
  3. Show live loading state (`Querying Agro-Cloud AI Deep Learning Microservice...`).
  4. Point out the returned result card:
     - **Disease Diagnosis**: `Yellow Rust (Puccinia striiformis)`
     - **Confidence Score**: `94%`
     - **Color-Coded Severity Badge**: 🔴 `URGENT ATTENTION`
     - **Agronomic Remedy**: *"Foliar spray of Propiconazole 25% EC @ 1 ml/L..."*
     - Point out that an urgent disease alert was automatically logged into the farmer's advisory timeline and triggered a local push notification.

---

## ⏱️ Minute 1:45 - 2:30 | Precision Irrigation & NPK Advisory Engine
- **Script**: *"Instead of generic advice, our AI Engine evaluates continuous soil telemetry against crop-specific agronomic thresholds."*
- **Action**:
  1. Tap **Advisory Tab** in bottom navigation.
  2. Show **Irrigation Prescription**: *"IRRIGATION NEEDED: Apply 5.5mm water. Reasoning: Soil moisture at 26.3% is below 30% threshold for Wheat."*
  3. Show **NPK Nutrient Prescription**: *"Apply MOP @ 15 kg/acre."*
  4. Show historical advisory logs list and tap **"Mark as Read ✓"** on an unread advisory card.

---

## ⏱️ Minute 2:30 - 3:30 | Direct Market Linkage & Smart Buyer Matching
- **Script**: *"To eliminate predatory middlemen, Agro-Cloud provides smart farm-to-market buyer matching based on price, distance, and real-time Mandi demand urgency."*
- **Action**:
  1. Tap **Mandi Rates Tab** in bottom navigation.
  2. Scroll to **List Harvest for Sale** form. Enter Quantity: `60` Quintals, Crop: `Wheat`.
  3. Tap **Create Listing & Find Buyers**.
  4. Show top 3 **AI Ranked Buyer Matches**:
     - **Match #1**: `AgriProcure Punjab Ltd` (Offered Price: INR 2,400.00/qtl, Distance: 12.5km, Demand Urgency: HIGH).
     - Point to the **"Why this match"** explanation box: *"Top Recommendation: Best overall price (INR 2,400.00/qtl), only 12.5km away with HIGH current demand."*
  5. Tap **"Accept This Buyer"** on Match #1.
  6. Show instant **Trade Confirmed** card displaying automated **Logistics Channel details**:
     - Pickup Date: Tomorrow's Date
     - Transporter: `Agro-Cloud Express Dispatch (Punjab-LOG-8842)`
     - Transit Time: `2.0 Hours`

---

## ⏱️ Minute 3:30 - 4:00 | 14-Day Mandi Price Forecasting & Conclusion
- **Script**: *"Finally, our AI Engine runs Facebook Prophet time-series models on historical Mandi spot prices to give farmers 14-day price forecasts and optimal selling windows."*
- **Action**:
  1. Scroll to **14-Day AI Price Forecast** card on Mandi tab.
  2. Point out current price (INR 2,283) vs projected peak (INR 2,312).
  3. Read the AI recommendation: *"Sell between Day 14 and Day 14 to capture peak projected price..."*
  4. Conclude: *"Agro-Cloud delivers a complete, production-ready, cloud-native agri ecosystem. Thank you!"*
