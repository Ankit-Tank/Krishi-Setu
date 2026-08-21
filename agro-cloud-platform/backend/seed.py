import random
from datetime import datetime, timedelta, date
from sqlalchemy.orm import Session
from app.db.session import engine, Base, SessionLocal
from app.models.models import (
    Farmer,
    Farm,
    TelemetryReading,
    MandiPrice,
    TradeListing,
    BuyerMatch,
    AdvisoryRecord
)


def seed_database():
    print("[INIT] Rebuilding database schema tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()

    try:
        # 1. Seed ~5 Farmers
        print("[SEED] Seeding 5 Farmers...")
        farmers_data = [
            {"name": "Gurpreet Singh", "phone": "+919876543210", "preferred_language": "hi", "region": "Punjab"},
            {"name": "Suresh Deshmukh", "phone": "+919876543211", "preferred_language": "mr", "region": "Maharashtra"},
            {"name": "Venkat Rao", "phone": "+919876543212", "preferred_language": "te", "region": "Andhra Pradesh"},
            {"name": "Rajesh Patel", "phone": "+919876543213", "preferred_language": "gu", "region": "Gujarat"},
            {"name": "Harpreet Kaur", "phone": "+919876543214", "preferred_language": "hi", "region": "Punjab"},
        ]

        farmer_objs = []
        for fdata in farmers_data:
            f = Farmer(**fdata)
            db.add(f)
            farmer_objs.append(f)
        db.commit()
        for f in farmer_objs:
            db.refresh(f)

        # 2. Seed 8 Farms across different crop types
        print("[SEED] Seeding 8 Farms across Wheat, Rice, Cotton, and Soybean...")
        farms_data = [
            {"farmer_id": farmer_objs[0].id, "name": "Khanna Wheat Plot A", "latitude": 30.7046, "longitude": 76.2205, "area_acres": 3.5, "crop_type": "Wheat"},
            {"farmer_id": farmer_objs[0].id, "name": "Ludhiana Wheat Plot B", "latitude": 30.9010, "longitude": 75.8573, "area_acres": 2.0, "crop_type": "Wheat"},
            {"farmer_id": farmer_objs[1].id, "name": "Nashik Soybean Field 1", "latitude": 19.9975, "longitude": 73.7898, "area_acres": 4.0, "crop_type": "Soybean"},
            {"farmer_id": farmer_objs[1].id, "name": "Pimpalgaon Cotton Field 2", "latitude": 20.1706, "longitude": 73.9872, "area_acres": 3.0, "crop_type": "Cotton"},
            {"farmer_id": farmer_objs[2].id, "name": "Godavari Rice Paddy North", "latitude": 16.9891, "longitude": 81.7835, "area_acres": 5.0, "crop_type": "Rice"},
            {"farmer_id": farmer_objs[2].id, "name": "Delta Paddy South", "latitude": 16.5062, "longitude": 80.6480, "area_acres": 2.5, "crop_type": "Rice"},
            {"farmer_id": farmer_objs[3].id, "name": "Rajkot Cotton Estate", "latitude": 22.3039, "longitude": 70.8022, "area_acres": 4.5, "crop_type": "Cotton"},
            {"farmer_id": farmer_objs[4].id, "name": "Karnal Wheat Farm", "latitude": 29.6857, "longitude": 76.9905, "area_acres": 3.0, "crop_type": "Wheat"},
        ]

        farm_objs = []
        for farm_data in farms_data:
            farm = Farm(**farm_data)
            db.add(farm)
            farm_objs.append(farm)
        db.commit()
        for farm in farm_objs:
            db.refresh(farm)

        # 3. Seed 30 days of realistic telemetry per farm (8 farms * 30 days = 240 readings)
        print("[SEED] Seeding 30 days of realistic simulated telemetry per farm...")
        now = datetime.utcnow()
        telemetry_objs = []

        for farm in farm_objs:
            crop_key = farm.crop_type.lower()
            for day_offset in range(30, 0, -1):
                timestamp = now - timedelta(days=day_offset)

                # Generate realistic crop-specific sensor metrics with slight daily variation
                if "wheat" in crop_key:
                    soil_moisture = max(20.0, min(45.0, 28.0 + random.uniform(-5.0, 8.0)))
                    soil_ph = round(random.uniform(6.5, 7.2), 2)
                    temp = round(22.0 + random.uniform(-3.0, 5.0), 1)
                    humidity = round(60.0 + random.uniform(-8.0, 12.0), 1)
                    n_ppm = max(80.0, min(160.0, 115.0 + random.uniform(-15.0, 20.0)))
                    p_ppm = round(22.0 + random.uniform(-4.0, 6.0), 1)
                    k_ppm = round(135.0 + random.uniform(-10.0, 15.0), 1)
                elif "rice" in crop_key:
                    soil_moisture = max(45.0, min(80.0, 62.0 + random.uniform(-8.0, 10.0)))
                    soil_ph = round(random.uniform(6.0, 6.8), 2)
                    temp = round(27.0 + random.uniform(-2.0, 4.0), 1)
                    humidity = round(78.0 + random.uniform(-5.0, 10.0), 1)
                    n_ppm = max(100.0, min(180.0, 130.0 + random.uniform(-20.0, 25.0)))
                    p_ppm = round(28.0 + random.uniform(-3.0, 5.0), 1)
                    k_ppm = round(155.0 + random.uniform(-12.0, 18.0), 1)
                elif "cotton" in crop_key:
                    soil_moisture = max(18.0, min(38.0, 25.0 + random.uniform(-4.0, 6.0)))
                    soil_ph = round(random.uniform(6.8, 7.6), 2)
                    temp = round(30.0 + random.uniform(-3.0, 4.0), 1)
                    humidity = round(52.0 + random.uniform(-6.0, 8.0), 1)
                    n_ppm = max(75.0, min(130.0, 98.0 + random.uniform(-12.0, 15.0)))
                    p_ppm = round(19.0 + random.uniform(-3.0, 4.0), 1)
                    k_ppm = round(118.0 + random.uniform(-8.0, 12.0), 1)
                else:  # Soybean
                    soil_moisture = max(22.0, min(42.0, 31.0 + random.uniform(-5.0, 7.0)))
                    soil_ph = round(random.uniform(6.3, 7.0), 2)
                    temp = round(26.0 + random.uniform(-2.0, 5.0), 1)
                    humidity = round(65.0 + random.uniform(-7.0, 9.0), 1)
                    n_ppm = max(70.0, min(120.0, 88.0 + random.uniform(-10.0, 12.0)))
                    p_ppm = round(26.0 + random.uniform(-4.0, 5.0), 1)
                    k_ppm = round(128.0 + random.uniform(-9.0, 14.0), 1)

                reading = TelemetryReading(
                    farm_id=farm.id,
                    timestamp=timestamp,
                    soil_moisture=round(soil_moisture, 1),
                    soil_ph=soil_ph,
                    temperature_c=temp,
                    humidity_pct=humidity,
                    nitrogen_ppm=round(n_ppm, 1),
                    phosphorus_ppm=p_ppm,
                    potassium_ppm=k_ppm
                )
                telemetry_objs.append(reading)

        db.bulk_save_objects(telemetry_objs)
        db.commit()

        # Seed initial Advisory records
        print("[SEED] Seeding Advisory records...")
        advisory_sample = [
            AdvisoryRecord(farm_id=farm_objs[0].id, type="irrigation", message="Irrigation Alert: Soil moisture dropped to 24.5%. Recommend 30mm drip irrigation in morning hours.", is_read=False),
            AdvisoryRecord(farm_id=farm_objs[0].id, type="npk", message="NPK Advice: Nitrogen level low (105 ppm). Apply top-dressing Urea @ 25 kg/acre.", is_read=True),
            AdvisoryRecord(farm_id=farm_objs[2].id, type="general", message="Weather Advisory: High humidity forecasted for next 48h. Monitor soybean crop for fungal leaf spot.", is_read=False),
        ]
        db.bulk_save_objects(advisory_sample)
        db.commit()

        # 4. Seed 20 Mandi Price entries across 4 crops and 3 mandis with realistic price trends
        print("[SEED] Seeding 20 Mandi Price records with realistic trends...")
        today_date = date.today()
        mandi_prices_data = []

        mandi_specs = [
            {"crop": "Wheat", "mandi": "Khanna Mandi", "region": "Punjab", "base": 2300.0, "trend": 5.0, "urgency": "high"},
            {"crop": "Wheat", "mandi": "Karnal Mandi", "region": "Haryana", "base": 2280.0, "trend": 4.5, "urgency": "medium"},
            {"crop": "Wheat", "mandi": "Indore APMC", "region": "Madhya Pradesh", "base": 2250.0, "trend": 6.0, "urgency": "normal"},
            {"crop": "Rice", "mandi": "Rajahmundry Mandi", "region": "Andhra Pradesh", "base": 3850.0, "trend": 8.0, "urgency": "high"},
            {"crop": "Rice", "mandi": "Karnal Mandi", "region": "Haryana", "base": 3950.0, "trend": 7.5, "urgency": "medium"},
            {"crop": "Cotton", "mandi": "Rajkot APMC", "region": "Gujarat", "base": 7450.0, "trend": 15.0, "urgency": "high"},
            {"crop": "Cotton", "mandi": "Pimpalgaon Mandi", "region": "Maharashtra", "base": 7400.0, "trend": 12.0, "urgency": "medium"},
            {"crop": "Soybean", "mandi": "Indore APMC", "region": "Madhya Pradesh", "base": 4600.0, "trend": 10.0, "urgency": "high"},
            {"crop": "Soybean", "mandi": "Lasalgaon Mandi", "region": "Maharashtra", "base": 4620.0, "trend": 9.0, "urgency": "medium"},
        ]

        record_count = 0
        for day_i in range(5, -1, -1):
            entry_date = today_date - timedelta(days=day_i)
            for spec in mandi_specs:
                if record_count >= 20:
                    break
                price = spec["base"] + (5 - day_i) * spec["trend"] + random.uniform(-15.0, 15.0)
                mp = MandiPrice(
                    crop_name=spec["crop"],
                    mandi_name=spec["mandi"],
                    region=spec["region"],
                    price_per_quintal=round(price, 2),
                    demand_urgency=spec["urgency"],
                    date=entry_date
                )
                mandi_prices_data.append(mp)
                record_count += 1

        db.bulk_save_objects(mandi_prices_data)
        db.commit()

        # 5. Seed 3 Sample Trade Listings & Buyer Matches
        print("[SEED] Seeding 3 Sample Trade Listings with ranked buyer matches...")
        trade_listings_data = [
            {"farmer_id": farmer_objs[0].id, "crop_type": "Wheat", "quantity_quintals": 50.0, "harvest_date": today_date + timedelta(days=5), "status": "open"},
            {"farmer_id": farmer_objs[1].id, "crop_type": "Soybean", "quantity_quintals": 40.0, "harvest_date": today_date + timedelta(days=7), "status": "open"},
            {"farmer_id": farmer_objs[3].id, "crop_type": "Cotton", "quantity_quintals": 30.0, "harvest_date": today_date + timedelta(days=10), "status": "open"},
        ]

        trade_objs = []
        for tdata in trade_listings_data:
            tl = TradeListing(**tdata)
            db.add(tl)
            trade_objs.append(tl)
        db.commit()
        for tl in trade_objs:
            db.refresh(tl)

        # Buyer matches for each trade listing
        matches_data = [
            # Listing 1 (Wheat)
            {"trade_listing_id": trade_objs[0].id, "buyer_name": "AgriProcure Punjab Ltd", "mandi_name": "Khanna Mandi", "distance_km": 12.5, "offered_price": 2420.0, "demand_urgency": "high", "logistics_note": "Direct farm-gate transport available in 24h."},
            {"trade_listing_id": trade_objs[0].id, "buyer_name": "National Grain Elevators", "mandi_name": "Ludhiana Central Hub", "distance_km": 25.0, "offered_price": 2450.0, "demand_urgency": "medium", "logistics_note": "Self-arranged logistics with offset subsidy."},
            {"trade_listing_id": trade_objs[0].id, "buyer_name": "Karnal Food Processing Co", "mandi_name": "Karnal Mandi", "distance_km": 85.0, "offered_price": 2480.0, "demand_urgency": "normal", "logistics_note": "Long distance transport via logistics partner."},

            # Listing 2 (Soybean)
            {"trade_listing_id": trade_objs[1].id, "buyer_name": "MahaOil Extractors", "mandi_name": "Lasalgaon APMC", "distance_km": 18.0, "offered_price": 4720.0, "demand_urgency": "high", "logistics_note": "Immediate payment upon truck loading."},
            {"trade_listing_id": trade_objs[1].id, "buyer_name": "Indore Protein Industries", "mandi_name": "Indore APMC", "distance_km": 140.0, "offered_price": 4850.0, "demand_urgency": "medium", "logistics_note": "Rail freight dispatch available."},

            # Listing 3 (Cotton)
            {"trade_listing_id": trade_objs[2].id, "buyer_name": "Gujarat Textile Mills", "mandi_name": "Rajkot APMC", "distance_km": 15.0, "offered_price": 7650.0, "demand_urgency": "high", "logistics_note": "Moisture test conducted at farm gate."},
            {"trade_listing_id": trade_objs[2].id, "buyer_name": "Saurashtra Ginning Corp", "mandi_name": "Gondal Mandi", "distance_km": 38.0, "offered_price": 7720.0, "demand_urgency": "medium", "logistics_note": "Pickup truck dispatched within 48h."},
        ]

        for mdata in matches_data:
            bm = BuyerMatch(**mdata)
            db.add(bm)
        db.commit()

        print("[SUCCESS] Database seeding completed successfully!")
        print(f"   * Farmers: {len(farmer_objs)}")
        print(f"   * Farms: {len(farm_objs)}")
        print(f"   * Telemetry Readings: {len(telemetry_objs)}")
        print(f"   * Mandi Prices: {len(mandi_prices_data)}")
        print(f"   * Trade Listings: {len(trade_objs)}")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Database seeding failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
