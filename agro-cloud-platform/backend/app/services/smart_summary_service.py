from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from app.models.models import Farm, Farmer, LeafScan, TelemetryReading, MandiPrice, BuyerMatch, TradeListing
from app.schemas.schemas import (
    SmartSummaryResponse,
    DiseasePillar,
    SoilPillar,
    MarketPillar,
)


class SmartSummaryService:
    @staticmethod
    def generate_smart_summary(farm_id: int, db: Session) -> SmartSummaryResponse:
        """
        Synthesize the 3 primary decision pillars for a farm into an all-in-one AI Smart Summary:
        1. Disease Diagnosis (Latest Leaf Scan)
        2. Soil & Precision Irrigation Advisory (Latest IoT Telemetry)
        3. Market Linkage & Mandi Match (Best Price & Route)
        """
        farm = db.query(Farm).filter(Farm.id == farm_id).first()
        if not farm:
            raise ValueError(f"Farm with ID {farm_id} not found.")

        farmer = db.query(Farmer).filter(Farmer.id == farm.farmer_id).first()

        # ----------------------------------------------------
        # Pillar 1: Latest Disease Diagnosis
        # ----------------------------------------------------
        latest_scan = (
            db.query(LeafScan)
            .filter(LeafScan.farm_id == farm_id)
            .order_by(LeafScan.uploaded_at.desc())
            .first()
        )

        # Fallback: if no scan on this farm, check if farmer has any scan on another farm
        if not latest_scan and farmer:
            latest_scan = (
                db.query(LeafScan)
                .join(Farm)
                .filter(Farm.farmer_id == farmer.id)
                .order_by(LeafScan.uploaded_at.desc())
                .first()
            )

        if latest_scan:
            disease_lower = latest_scan.predicted_disease.lower()
            is_healthy = "healthy" in disease_lower and not ("blight" in disease_lower or "rot" in disease_lower or "rust" in disease_lower or "spot" in disease_lower)
            
            if is_healthy:
                disease_status = "HEALTHY"
                treatment_window = None
                action_text = "Leaves are clean and pathogen-free. Continue routine field scouting."
                disease_phrase = f"Your {farm.crop_type.lower()} shows healthy foliage with no active disease detected"
            else:
                disease_status = "DISEASED"
                treatment_window = "within 48 hours"
                action_text = f"Treat {latest_scan.predicted_disease} with recommended fungicide/bactericide within 48h."
                disease_phrase = f"Your {farm.crop_type.lower()} shows {latest_scan.predicted_disease.lower()} — treat within 48 hours"

            disease_pillar = DiseasePillar(
                has_scan=True,
                status=disease_status,
                predicted_disease=latest_scan.predicted_disease,
                confidence_score=round(float(latest_scan.confidence_score), 2),
                treatment_window=treatment_window,
                action_text=action_text,
                scan_date=latest_scan.uploaded_at.strftime("%Y-%m-%d %H:%M") if latest_scan.uploaded_at else None,
            )
        else:
            disease_pillar = DiseasePillar(
                has_scan=False,
                status="NO_SCAN",
                predicted_disease=None,
                confidence_score=None,
                treatment_window=None,
                action_text="No leaf scan on record. Take a photo to diagnose crop health.",
                scan_date=None,
            )
            disease_phrase = f"Your {farm.crop_type.lower()} has no recent disease scan on record"

        # ----------------------------------------------------
        # Pillar 2: Soil Moisture & NPK Advisory
        # ----------------------------------------------------
        latest_telemetry = (
            db.query(TelemetryReading)
            .filter(TelemetryReading.farm_id == farm_id)
            .order_by(TelemetryReading.timestamp.desc())
            .first()
        )

        if latest_telemetry:
            moisture = latest_telemetry.soil_moisture
            if moisture < 22.0:
                moisture_status = "LOW"
                action_text = "Soil moisture is critically low. Apply 35mm irrigation immediately."
                soil_phrase = f"Soil moisture is critically low ({moisture:.1f}%), irrigate today"
            elif moisture < 28.0:
                moisture_status = "LOW"
                action_text = "Soil moisture is dropping. Schedule irrigation within 24 hours."
                soil_phrase = f"Soil moisture is low ({moisture:.1f}%), irrigate today"
            elif moisture > 50.0:
                moisture_status = "HIGH"
                action_text = "Soil is waterlogged. Pause irrigation and verify drainage."
                soil_phrase = f"Soil moisture is high ({moisture:.1f}%), pause irrigation"
            else:
                moisture_status = "OPTIMAL"
                action_text = "Soil moisture is in the optimal agronomic band."
                soil_phrase = f"Soil moisture is optimal ({moisture:.1f}%)"

            # NPK assessment
            if latest_telemetry.nitrogen_ppm < 100.0 or latest_telemetry.potassium_ppm < 130.0:
                npk_status = "DEFICIENT"
            else:
                npk_status = "BALANCED"

            soil_pillar = SoilPillar(
                moisture_pct=round(float(moisture), 1),
                moisture_status=moisture_status,
                npk_status=npk_status,
                action_text=action_text,
            )
        else:
            soil_pillar = SoilPillar(
                moisture_pct=None,
                moisture_status="OFFLINE",
                npk_status="OFFLINE",
                action_text="Telemetry sensor offline. Check IoT gateway.",
            )
            soil_phrase = "Soil moisture sensor is currently offline"

        # ----------------------------------------------------
        # Pillar 3: Best Mandi Match & Price Advantage
        # ----------------------------------------------------
        # Try finding top MandiPrice matching crop and region
        mandi_query = db.query(MandiPrice).filter(MandiPrice.crop_name.ilike(f"%{farm.crop_type}%"))
        if farmer and farmer.region:
            region_match = mandi_query.filter(MandiPrice.region.ilike(f"%{farmer.region}%")).order_by(MandiPrice.price_per_quintal.desc()).first()
            best_mandi = region_match or mandi_query.order_by(MandiPrice.price_per_quintal.desc()).first()
        else:
            best_mandi = mandi_query.order_by(MandiPrice.price_per_quintal.desc()).first()

        # Fallback to any mandi price if crop specific not found
        if not best_mandi:
            best_mandi = db.query(MandiPrice).order_by(MandiPrice.price_per_quintal.desc()).first()

        if best_mandi:
            mandi_name = best_mandi.mandi_name
            region_name = best_mandi.region
            price = best_mandi.price_per_quintal
            demand = best_mandi.demand_urgency or "high"
            distance_km = 12.0  # standard local mandi radius
            action_text = f"Top rate at {mandi_name} (₹{price:,.0f}/qtl, {distance_km:.0f}km away with {demand} demand)."
            market_phrase = f"Once harvested, {mandi_name} currently offers the best price of ₹{price:,.0f}/qtl {distance_km:.0f}km away"
        else:
            mandi_name = "Khanna APMC Mandi"
            region_name = "Punjab"
            price = 2380.0
            demand = "high"
            distance_km = 12.0
            action_text = f"Top regional rate at {mandi_name} (₹{price:,.0f}/qtl)."
            market_phrase = f"Once harvested, {mandi_name} currently offers the best price of ₹{price:,.0f}/qtl {distance_km:.0f}km away"

        market_pillar = MarketPillar(
            mandi_name=mandi_name,
            region=region_name,
            best_price_per_quintal=price,
            distance_km=distance_km,
            demand_urgency=demand,
            action_text=action_text,
        )

        # ----------------------------------------------------
        # Combined Narrative & Urgency Computation
        # ----------------------------------------------------
        summary_text = f"{disease_phrase}. {soil_phrase}. {market_phrase}."

        if disease_pillar.status == "DISEASED" or soil_pillar.moisture_status == "LOW":
            urgency_level = "HIGH"
            headline = "⚠️ Urgent Field & Market Action Recommended"
        elif disease_pillar.status == "NO_SCAN" or soil_pillar.npk_status == "DEFICIENT":
            urgency_level = "MEDIUM"
            headline = "🔔 Field Maintenance & Optimal Selling Window"
        else:
            urgency_level = "NORMAL"
            headline = "✅ Crop Health & Market Alignment on Track"

        return SmartSummaryResponse(
            farm_id=farm.id,
            farmer_id=farm.farmer_id,
            farm_name=farm.name,
            crop_type=farm.crop_type,
            headline=headline,
            summary_text=summary_text,
            urgency_level=urgency_level,
            disease=disease_pillar,
            soil_irrigation=soil_pillar,
            market=market_pillar,
            generated_at=datetime.now(timezone.utc).isoformat(),
        )
