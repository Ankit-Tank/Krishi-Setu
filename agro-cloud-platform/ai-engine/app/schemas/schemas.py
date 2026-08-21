from typing import List, Optional, Dict
from datetime import date
from pydantic import BaseModel, Field


# ----------------------------------------------------
# 1. Disease Detection Schemas
# ----------------------------------------------------
class DiseasePredictResponse(BaseModel):
    disease_name: str = Field(..., example="Tomato Early Blight")
    confidence: float = Field(..., example=0.94)
    recommended_action: str = Field(..., example="Apply copper-based fungicide within 48 hours, isolate affected plants.")
    source: str = Field(..., example="HuggingFace / MobilenetV2 (Fallback: Vision Heuristics)")


# ----------------------------------------------------
# 2. NPK / Irrigation Advisory Schemas
# ----------------------------------------------------
class AdvisoryPredictRequest(BaseModel):
    crop_type: str = Field(..., example="Wheat")
    soil_moisture: float = Field(..., example=24.5)  # %
    soil_ph: float = Field(..., example=6.8)
    nitrogen_ppm: float = Field(..., example=95.0)
    phosphorus_ppm: float = Field(..., example=18.0)
    potassium_ppm: float = Field(..., example=115.0)
    temperature_c: float = Field(..., example=28.0)
    humidity_pct: float = Field(..., example=62.0)


class AdvisoryPredictResponse(BaseModel):
    irrigation_needed: bool = Field(..., example=True)
    irrigation_amount_mm: float = Field(..., example=25.0)
    npk_recommendation: str = Field(..., example="Top-dress with Urea @ 25 kg/acre and MOP @ 15 kg/acre.")
    reasoning: str = Field(..., example="Soil moisture is at 24.5% (below 30.0% threshold). Nitrogen and Potassium PPM are below crop profile requirement.")


# ----------------------------------------------------
# 3. Yield Forecasting Schemas
# ----------------------------------------------------
class YieldForecastRequest(BaseModel):
    crop_type: str = Field(..., example="Wheat")
    region: str = Field(..., example="Punjab")
    planting_date: Optional[date] = Field(None, example="2026-06-01")
    historical_telemetry_summary: Optional[Dict[str, float]] = Field(
        None, example={"avg_moisture": 32.0, "avg_temp": 25.0, "avg_ph": 6.8}
    )


class YieldForecastResponse(BaseModel):
    crop_type: str
    region: str
    projected_harvest_start: str
    projected_harvest_end: str
    estimated_yield_quintals_per_acre: float
    growth_stage: str
    reasoning: str


# ----------------------------------------------------
# 4. Price Forecasting Schemas
# ----------------------------------------------------
class HistoricalPricePoint(BaseModel):
    date: date
    price: float


class PriceForecastRequest(BaseModel):
    crop_name: str = Field(..., example="Wheat")
    mandi_name: str = Field(..., example="Khanna Mandi")
    historical_prices: Optional[List[HistoricalPricePoint]] = None


class PriceForecastResponse(BaseModel):
    crop_name: str
    mandi_name: str
    current_price: float
    forecast_dates: List[str]
    forecast_prices: List[float]
    projected_max_price: float
    best_time_to_sell_recommendation: str
