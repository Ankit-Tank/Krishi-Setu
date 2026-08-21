from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text, Date
from sqlalchemy.orm import relationship
from app.db.session import Base


class Farmer(Base):
    __tablename__ = "farmers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    preferred_language = Column(String(10), default="hi")
    region = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    farms = relationship("Farm", back_populates="farmer", cascade="all, delete-orphan")
    trade_listings = relationship("TradeListing", back_populates="farmer", cascade="all, delete-orphan")


class Farm(Base):
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"), nullable=False)
    name = Column(String(150), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    area_acres = Column(Float, default=1.0)
    crop_type = Column(String(100), nullable=False)

    farmer = relationship("Farmer", back_populates="farms")
    telemetry_readings = relationship("TelemetryReading", back_populates="farm", cascade="all, delete-orphan")
    leaf_scans = relationship("LeafScan", back_populates="farm", cascade="all, delete-orphan")
    advisories = relationship("AdvisoryRecord", back_populates="farm", cascade="all, delete-orphan")


class TelemetryReading(Base):
    __tablename__ = "telemetry_readings"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    soil_moisture = Column(Float, nullable=False)  # %
    soil_ph = Column(Float, nullable=False)
    temperature_c = Column(Float, nullable=False)
    humidity_pct = Column(Float, nullable=False)
    nitrogen_ppm = Column(Float, nullable=False)
    phosphorus_ppm = Column(Float, nullable=False)
    potassium_ppm = Column(Float, nullable=False)

    farm = relationship("Farm", back_populates="telemetry_readings")


class LeafScan(Base):
    __tablename__ = "leaf_scans"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False, index=True)
    image_url = Column(String(500), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    predicted_disease = Column(String(200), nullable=False)
    confidence_score = Column(Float, nullable=False)
    advisory_text = Column(Text, nullable=True)

    farm = relationship("Farm", back_populates="leaf_scans")


class AdvisoryRecord(Base):
    __tablename__ = "advisory_records"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id"), nullable=False, index=True)
    type = Column(String(50), nullable=False)  # irrigation / npk / disease / general
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_read = Column(Boolean, default=False)

    farm = relationship("Farm", back_populates="advisories")


class MandiPrice(Base):
    __tablename__ = "mandi_prices"

    id = Column(Integer, primary_key=True, index=True)
    crop_name = Column(String(100), nullable=False, index=True)
    mandi_name = Column(String(150), nullable=False, index=True)
    region = Column(String(100), nullable=False, index=True)
    price_per_quintal = Column(Float, nullable=False)
    demand_urgency = Column(String(50), default="normal")  # high / medium / normal
    date = Column(Date, nullable=False, index=True)


class TradeListing(Base):
    __tablename__ = "trade_listings"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"), nullable=False, index=True)
    crop_type = Column(String(100), nullable=False)
    quantity_quintals = Column(Float, nullable=False)
    harvest_date = Column(Date, nullable=False)
    status = Column(String(50), default="open")  # open / matched / closed
    created_at = Column(DateTime, default=datetime.utcnow)

    farmer = relationship("Farmer", back_populates="trade_listings")
    buyer_matches = relationship("BuyerMatch", back_populates="trade_listing", cascade="all, delete-orphan")
    logistics = relationship("LogisticsRecord", back_populates="trade_listing", uselist=False, cascade="all, delete-orphan")


class BuyerMatch(Base):
    __tablename__ = "buyer_matches"

    id = Column(Integer, primary_key=True, index=True)
    trade_listing_id = Column(Integer, ForeignKey("trade_listings.id"), nullable=False, index=True)
    buyer_name = Column(String(150), nullable=False)
    mandi_name = Column(String(150), nullable=False)
    distance_km = Column(Float, nullable=False)
    offered_price = Column(Float, nullable=False)
    demand_urgency = Column(String(50), default="normal")  # high / medium / normal
    logistics_note = Column(Text, nullable=True)

    trade_listing = relationship("TradeListing", back_populates="buyer_matches")


class LogisticsRecord(Base):
    __tablename__ = "logistics_records"

    id = Column(Integer, primary_key=True, index=True)
    trade_listing_id = Column(Integer, ForeignKey("trade_listings.id"), nullable=False, index=True, unique=True)
    buyer_match_id = Column(Integer, ForeignKey("buyer_matches.id"), nullable=False)
    pickup_date = Column(Date, nullable=False)
    transporter_name = Column(String(200), nullable=False)
    estimated_transit_hours = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    trade_listing = relationship("TradeListing", back_populates="logistics")
