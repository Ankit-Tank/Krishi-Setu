from typing import List, Optional, Dict, Any
from datetime import date, timedelta
import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.config import settings
from app.models.models import MandiPrice, TradeListing, BuyerMatch, Farmer, Farm, TelemetryReading, LogisticsRecord
from app.schemas.schemas import (
    MandiPriceResponse,
    MandiPriceCreate,
    TradeListingCreate,
    TradeListingResponse,
    YieldForecastResult,
    PriceForecastResult,
    TradeConfirmRequest,
    TradeConfirmResponse,
    LogisticsRecordResponse
)
from app.services.buyer_matcher import BuyerMatcher

router = APIRouter(prefix="/market", tags=["Market & Trade"])


@router.get("/prices", response_model=List[MandiPriceResponse])
def get_mandi_prices(
    crop: Optional[str] = None,
    region: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Query mandi spot price entries filtered by crop name and region."""
    query = db.query(MandiPrice)
    if crop:
        query = query.filter(MandiPrice.crop_name.ilike(f"%{crop}%"))
    if region:
        query = query.filter(MandiPrice.region.ilike(f"%{region}%"))
    return query.order_by(MandiPrice.date.desc()).all()


@router.post("/prices", response_model=MandiPriceResponse, status_code=status.HTTP_201_CREATED)
def create_mandi_price(payload: MandiPriceCreate, db: Session = Depends(get_db)):
    """Add a new mandi price entry."""
    entry = MandiPrice(**payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.post("/trade-listing", response_model=TradeListingResponse, status_code=status.HTTP_201_CREATED)
def create_trade_listing(payload: TradeListingCreate, db: Session = Depends(get_db)):
    """Create a new harvest trade listing for sale and generate initial buyer matches."""
    farmer = db.query(Farmer).filter(Farmer.id == payload.farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found.")

    listing = TradeListing(**payload.model_dump(), status="open")
    db.add(listing)
    db.commit()
    db.refresh(listing)

    # Query latest Mandi prices to determine demand urgency for candidate buyers
    mandi_records = (
        db.query(MandiPrice)
        .filter(MandiPrice.crop_name.ilike(f"%{payload.crop_type}%"))
        .order_by(MandiPrice.date.desc())
        .all()
    )

    urgency_map = {m.mandi_name.lower(): m.demand_urgency for m in mandi_records}

    buyers_sample = [
        {"buyer": "AgriProcure Punjab Ltd", "mandi": f"{farmer.region} APMC Main", "dist": 12.5, "price_boost": 50.0},
        {"buyer": "National Grain Elevators", "mandi": f"{farmer.region} District Hub", "dist": 25.0, "price_boost": 90.0},
        {"buyer": "Farmer Direct Co-op", "mandi": "Central State Mandi", "dist": 45.0, "price_boost": 120.0},
    ]

    base_price = 2200.0
    if "wheat" in payload.crop_type.lower():
        base_price = 2350.0
    elif "rice" in payload.crop_type.lower() or "paddy" in payload.crop_type.lower():
        base_price = 3900.0
    elif "cotton" in payload.crop_type.lower():
        base_price = 7500.0
    elif "soybean" in payload.crop_type.lower():
        base_price = 4600.0

    for idx, b in enumerate(buyers_sample):
        mandi_lower = b["mandi"].lower()
        urgency = urgency_map.get(mandi_lower, "high" if idx == 0 else ("medium" if idx == 1 else "normal"))
        match = BuyerMatch(
            trade_listing_id=listing.id,
            buyer_name=b["buyer"],
            mandi_name=b["mandi"],
            distance_km=b["dist"],
            offered_price=base_price + b["price_boost"],
            demand_urgency=urgency,
            logistics_note="Pickup available in 24h. Farm-gate dispatch."
        )
        db.add(match)

    db.commit()
    db.refresh(listing)
    return listing


@router.get("/matches/{trade_listing_id}", response_model=List[Dict[str, Any]])
def get_ranked_buyer_matches(trade_listing_id: int, db: Session = Depends(get_db)):
    """
    Returns top 3 ranked buyer/mandi matches weighted by:
    (a) offered price, (b) distance to mandi, (c) demand urgency at mandi, with clear reasoning string.
    """
    listing = db.query(TradeListing).filter(TradeListing.id == trade_listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Trade listing not found.")

    matches = db.query(BuyerMatch).filter(BuyerMatch.trade_listing_id == trade_listing_id).all()
    if not matches:
        return []

    return BuyerMatcher.rank_matches(matches, limit=3)


@router.post("/trade-listing/{id}/confirm", response_model=TradeConfirmResponse)
def confirm_trade_listing(id: int, payload: TradeConfirmRequest, db: Session = Depends(get_db)):
    """
    Farmer accepts a specific buyer match:
    - Updates TradeListing.status to 'matched'
    - Provisions a LogisticsRecord (pickup_date, transporter_name, estimated_transit_hours)
    """
    listing = db.query(TradeListing).filter(TradeListing.id == id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Trade listing not found.")

    match = db.query(BuyerMatch).filter(
        BuyerMatch.id == payload.buyer_match_id,
        BuyerMatch.trade_listing_id == id
    ).first()
    if not match:
        raise HTTPException(status_code=404, detail="Specified buyer match not found for this listing.")

    # Update trade listing status to matched
    listing.status = "matched"

    # Check if logistics record already exists
    existing_logistics = db.query(LogisticsRecord).filter(LogisticsRecord.trade_listing_id == id).first()
    if not existing_logistics:
        transporter_name = f"Agro-Cloud Express Dispatch ({match.mandi_name.split()[0]}-LOG-8842)"
        transit_hrs = max(2.0, round((match.distance_km / 35.0) * 2.0, 1))
        logistics = LogisticsRecord(
            trade_listing_id=id,
            buyer_match_id=match.id,
            pickup_date=date.today() + timedelta(days=1),
            transporter_name=transporter_name,
            estimated_transit_hours=transit_hrs
        )
        db.add(logistics)
        db.commit()
        db.refresh(logistics)
    else:
        logistics = existing_logistics

    return TradeConfirmResponse(
        trade_listing_id=id,
        status=listing.status,
        selected_buyer_name=match.buyer_name,
        mandi_name=match.mandi_name,
        offered_price=match.offered_price,
        logistics=LogisticsRecordResponse.model_validate(logistics)
    )


# ----------------------------------------------------
# AI Forecasting Endpoints
# ----------------------------------------------------
@router.get("/yield-forecast/{farm_id}", response_model=YieldForecastResult)
async def get_farm_yield_forecast(farm_id: int, db: Session = Depends(get_db)):
    """Call AI Engine /predict/yield-forecast for a farm based on telemetry and crop cycle."""
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found.")

    farmer = db.query(Farmer).filter(Farmer.id == farm.farmer_id).first()
    region = farmer.region if farmer else "Punjab"

    latest_telemetry = (
        db.query(TelemetryReading)
        .filter(TelemetryReading.farm_id == farm_id)
        .order_by(TelemetryReading.timestamp.desc())
        .first()
    )

    telemetry_summary = {
        "avg_moisture": latest_telemetry.soil_moisture if latest_telemetry else 30.0,
        "avg_temp": latest_telemetry.temperature_c if latest_telemetry else 25.0,
        "avg_ph": latest_telemetry.soil_ph if latest_telemetry else 6.8
    }

    ai_url = f"{settings.AI_ENGINE_URL}/predict/yield-forecast"
    payload = {
        "crop_type": farm.crop_type,
        "region": region,
        "historical_telemetry_summary": telemetry_summary
    }

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.post(ai_url, json=payload)
            if response.status_code == 200:
                data = response.json()
                return YieldForecastResult(
                    farm_id=farm_id,
                    crop_type=farm.crop_type,
                    region=region,
                    projected_harvest_start=data.get("projected_harvest_start", "2026-09-01"),
                    projected_harvest_end=data.get("projected_harvest_end", "2026-09-10"),
                    estimated_yield_quintals_per_acre=data.get("estimated_yield_quintals_per_acre", 18.0),
                    growth_stage=data.get("growth_stage", "Tillering"),
                    reasoning=data.get("reasoning", "Standard life-cycle calculation.")
                )
    except Exception as e:
        print(f"[Backend Warning] AI Engine yield forecast endpoint at {ai_url} unreachable: {e}. Using local fallback.")

    return YieldForecastResult(
        farm_id=farm_id,
        crop_type=farm.crop_type,
        region=region,
        projected_harvest_start="2026-09-05",
        projected_harvest_end="2026-09-15",
        estimated_yield_quintals_per_acre=18.5,
        growth_stage="Heading",
        reasoning=f"Fallback lifecycle estimate for {farm.crop_type} in {region}."
    )


@router.get("/price-forecast", response_model=PriceForecastResult)
async def get_mandi_price_forecast(
    crop: str = "Wheat",
    mandi: str = "Khanna Mandi",
    db: Session = Depends(get_db)
):
    """Query recent Mandi prices from DB and call AI Engine /predict/price-forecast for 14-day price prediction."""
    hist_records = (
        db.query(MandiPrice)
        .filter(MandiPrice.crop_name.ilike(f"%{crop}%"))
        .order_by(MandiPrice.date.asc())
        .limit(30)
        .all()
    )

    historical_points = [
        {"date": rec.date.isoformat(), "price": rec.price_per_quintal}
        for rec in hist_records
    ]

    ai_url = f"{settings.AI_ENGINE_URL}/predict/price-forecast"
    payload = {
        "crop_name": crop,
        "mandi_name": mandi,
        "historical_prices": historical_points
    }

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.post(ai_url, json=payload)
            if response.status_code == 200:
                data = response.json()
                return PriceForecastResult(
                    crop_name=crop,
                    mandi_name=mandi,
                    current_price=data.get("current_price", 2350.0),
                    forecast_dates=data.get("forecast_dates", []),
                    forecast_prices=data.get("forecast_prices", []),
                    projected_max_price=data.get("projected_max_price", 2450.0),
                    best_time_to_sell_recommendation=data.get("best_time_to_sell_recommendation", "Sell in next 7 days.")
                )
    except Exception as e:
        print(f"[Backend Warning] AI Engine price forecast endpoint at {ai_url} unreachable: {e}. Using local fallback.")

    base_p = hist_records[-1].price_per_quintal if hist_records else 2350.0
    return PriceForecastResult(
        crop_name=crop,
        mandi_name=mandi,
        current_price=base_p,
        forecast_dates=["2026-08-21", "2026-08-22", "2026-08-23", "2026-08-24", "2026-08-25"],
        forecast_prices=[base_p + 10, base_p + 25, base_p + 40, base_p + 55, base_p + 70],
        projected_max_price=base_p + 70,
        best_time_to_sell_recommendation=f"Optimal selling window for {crop} at {mandi}: Sell in 5 days for peak price."
    )
