from typing import List, Optional
from datetime import datetime, date as DateType
from pydantic import BaseModel, Field


# ----------------------------------------------------
# Farmer Schemas
# ----------------------------------------------------
class FarmerBase(BaseModel):
    name: str = Field(..., example="Ramesh Kumar")
    phone: str = Field(..., example="+919876543210")
    preferred_language: str = Field("en", example="en")
    region: str = Field(..., example="Punjab")
    experience_years: Optional[int] = Field(None, example=5)


class FarmerCreate(FarmerBase):
    pass


class FarmerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    preferred_language: Optional[str] = None
    region: Optional[str] = None
    experience_years: Optional[int] = None


class FarmerResponse(FarmerBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ----------------------------------------------------
# Farm Schemas
# ----------------------------------------------------
class FarmBase(BaseModel):
    farmer_id: int = Field(..., example=1)
    name: str = Field(..., example="Green Valley Field A")
    latitude: Optional[float] = Field(30.9010, example=30.9010)
    longitude: Optional[float] = Field(75.8573, example=75.8573)
    area_acres: float = Field(2.5, example=2.5)
    crop_type: str = Field(..., example="Wheat")
    irrigation_source: Optional[str] = Field("borewell", example="borewell")
    preferred_season: Optional[str] = Field("both", example="both")


class FarmCreate(FarmBase):
    pass


class FarmUpdate(BaseModel):
    name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    area_acres: Optional[float] = None
    crop_type: Optional[str] = None
    irrigation_source: Optional[str] = None
    preferred_season: Optional[str] = None


class FarmResponse(FarmBase):
    id: int

    class Config:
        from_attributes = True


# ----------------------------------------------------
# Telemetry Schemas
# ----------------------------------------------------
class TelemetryReadingCreate(BaseModel):
    farm_id: int = Field(..., example=1)
    timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow)
    soil_moisture: float = Field(..., example=28.5)
    soil_ph: float = Field(..., example=6.8)
    temperature_c: float = Field(..., example=26.4)
    humidity_pct: float = Field(..., example=65.0)
    nitrogen_ppm: float = Field(..., example=110.0)
    phosphorus_ppm: float = Field(..., example=22.0)
    potassium_ppm: float = Field(..., example=140.0)


class TelemetryBatchIngest(BaseModel):
    readings: List[TelemetryReadingCreate]


class TelemetryReadingResponse(TelemetryReadingCreate):
    id: int

    class Config:
        from_attributes = True


# ----------------------------------------------------
# Leaf Scan Schemas
# ----------------------------------------------------
class LeafScanResponse(BaseModel):
    id: int
    farm_id: int
    image_url: str
    uploaded_at: datetime
    predicted_disease: str
    confidence_score: float
    advisory_text: Optional[str]

    class Config:
        from_attributes = True


# ----------------------------------------------------
# Advisory Schemas
# ----------------------------------------------------
class AdvisoryRecordResponse(BaseModel):
    id: int
    farm_id: int
    type: str
    message: str
    created_at: datetime
    is_read: bool

    class Config:
        from_attributes = True


class RuleBasedAdvisoryResponse(BaseModel):
    farm_id: int
    crop_type: str
    latest_telemetry: Optional[TelemetryReadingResponse]
    irrigation_advice: str
    npk_advice: str
    ph_advice: str
    advisory_records: List[AdvisoryRecordResponse]


# ----------------------------------------------------
# Mandi Price Schemas
# ----------------------------------------------------
class MandiPriceBase(BaseModel):
    crop_name: str = Field(..., example="Wheat")
    mandi_name: str = Field(..., example="Khanna Mandi")
    region: str = Field(..., example="Punjab")
    price_per_quintal: float = Field(..., example=2350.0)
    demand_urgency: str = Field("normal", example="high")
    date: DateType = Field(..., example="2026-08-20")


class MandiPriceCreate(MandiPriceBase):
    pass


class MandiPriceResponse(MandiPriceBase):
    id: int

    class Config:
        from_attributes = True


# ----------------------------------------------------
# Trade Listing & Buyer Match Schemas
# ----------------------------------------------------
class TradeListingBase(BaseModel):
    farmer_id: int = Field(..., example=1)
    crop_type: str = Field(..., example="Wheat")
    quantity_quintals: float = Field(..., example=50.0)
    harvest_date: DateType = Field(..., example="2026-08-25")


class TradeListingCreate(TradeListingBase):
    pass


class TradeListingResponse(TradeListingBase):
    id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class BuyerMatchBase(BaseModel):
    trade_listing_id: int
    buyer_name: str
    mandi_name: str
    distance_km: float
    offered_price: float
    demand_urgency: str = "normal"
    logistics_note: Optional[str]


class BuyerMatchResponse(BuyerMatchBase):
    id: int
    score: Optional[float] = None
    explanation: Optional[str] = None

    class Config:
        from_attributes = True


class TradeConfirmRequest(BaseModel):
    buyer_match_id: int = Field(..., example=1)


class LogisticsRecordResponse(BaseModel):
    id: int
    trade_listing_id: int
    buyer_match_id: int
    pickup_date: DateType
    transporter_name: str
    estimated_transit_hours: float
    created_at: datetime

    class Config:
        from_attributes = True


class TradeConfirmResponse(BaseModel):
    trade_listing_id: int
    status: str
    selected_buyer_name: str
    mandi_name: str
    offered_price: float
    logistics: LogisticsRecordResponse


# ----------------------------------------------------
# AI Forecasting Schemas
# ----------------------------------------------------
class YieldForecastResult(BaseModel):
    farm_id: int
    crop_type: str
    region: str
    projected_harvest_start: str
    projected_harvest_end: str
    estimated_yield_quintals_per_acre: float
    growth_stage: str
    reasoning: str
    source: str = "Agro-Cloud AI Engine"


class PriceForecastResult(BaseModel):
    crop_name: str
    mandi_name: str
    current_price: float
    forecast_dates: List[str]
    forecast_prices: List[float]
    projected_max_price: float
    best_time_to_sell_recommendation: str
    source: str = "Agro-Cloud AI Engine"


# ----------------------------------------------------
# Farmer Timeline / History Schemas
# ----------------------------------------------------
class HistoryItem(BaseModel):
    id: str
    item_type: str  # "leaf_scan" or "advisory"
    farm_id: int
    farm_name: str
    crop_type: str
    timestamp: datetime
    title: str
    message: str
    # Leaf scan specific fields
    image_url: Optional[str] = None
    predicted_disease: Optional[str] = None
    confidence_score: Optional[float] = None
    advisory_text: Optional[str] = None
    # Advisory specific fields
    advisory_type: Optional[str] = None
    is_read: Optional[bool] = None


class FarmerHistoryResponse(BaseModel):
    farmer_id: int
    farmer_name: str
    total_items: int
    leaf_scans_count: int
    advisories_count: int
    timeline: List[HistoryItem]

