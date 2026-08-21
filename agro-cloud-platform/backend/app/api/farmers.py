from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import Farmer, Farm, LeafScan, AdvisoryRecord
from app.schemas.schemas import (
    FarmerCreate,
    FarmerUpdate,
    FarmerResponse,
    FarmerHistoryResponse,
    HistoryItem,
)

router = APIRouter(prefix="/farmers", tags=["Farmers"])
singular_router = APIRouter(prefix="/farmer", tags=["Farmers"])


@router.post("", response_model=FarmerResponse, status_code=status.HTTP_201_CREATED)
def create_farmer(payload: FarmerCreate, db: Session = Depends(get_db)):
    """Create a new farmer profile or update if existing by phone."""
    existing = db.query(Farmer).filter(Farmer.phone == payload.phone).first()
    if existing:
        existing.name = payload.name
        existing.region = payload.region
        existing.preferred_language = payload.preferred_language
        if payload.experience_years is not None:
            existing.experience_years = payload.experience_years
        db.commit()
        db.refresh(existing)
        return existing
    
    farmer = Farmer(**payload.model_dump())
    db.add(farmer)
    db.commit()
    db.refresh(farmer)
    return farmer


@router.get("", response_model=List[FarmerResponse])
def list_farmers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all registered farmers."""
    return db.query(Farmer).offset(skip).limit(limit).all()


@router.get("/{farmer_id}", response_model=FarmerResponse)
def get_farmer(farmer_id: int, db: Session = Depends(get_db)):
    """Get farmer profile by ID."""
    farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found.")
    return farmer


@router.put("/{farmer_id}", response_model=FarmerResponse)
def update_farmer(farmer_id: int, payload: FarmerUpdate, db: Session = Depends(get_db)):
    """Update farmer profile."""
    farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found.")
    
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(farmer, key, value)
    
    db.commit()
    db.refresh(farmer)
    return farmer


@router.delete("/{farmer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_farmer(farmer_id: int, db: Session = Depends(get_db)):
    """Delete farmer profile."""
    farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found.")
    db.delete(farmer)
    db.commit()
    return None


@router.get("/{farmer_id}/history", response_model=FarmerHistoryResponse)
@singular_router.get("/{farmer_id}/history", response_model=FarmerHistoryResponse)
def get_farmer_history(farmer_id: int, db: Session = Depends(get_db)):
    """
    Get combined chronological timeline of past leaf scans and advisory records
    for all farm plots owned by the farmer, ordered newest first.
    """
    farmer = db.query(Farmer).filter(Farmer.id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found.")

    farms = db.query(Farm).filter(Farm.farmer_id == farmer_id).all()
    farm_map = {f.id: f for f in farms}
    farm_ids = list(farm_map.keys())

    timeline: List[HistoryItem] = []

    if farm_ids:
        # 1. Fetch all leaf scans
        scans = (
            db.query(LeafScan)
            .filter(LeafScan.farm_id.in_(farm_ids))
            .order_by(LeafScan.uploaded_at.desc())
            .all()
        )
        for s in scans:
            farm = farm_map.get(s.farm_id)
            timeline.append(
                HistoryItem(
                    id=f"scan-{s.id}",
                    item_type="leaf_scan",
                    farm_id=s.farm_id,
                    farm_name=farm.name if farm else f"Farm #{s.farm_id}",
                    crop_type=farm.crop_type if farm else "Crop",
                    timestamp=s.uploaded_at,
                    title=f"Leaf Disease Scan: {s.predicted_disease}",
                    message=s.advisory_text or f"Diagnosed with {round(s.confidence_score * 100)}% confidence.",
                    image_url=s.image_url,
                    predicted_disease=s.predicted_disease,
                    confidence_score=s.confidence_score,
                    advisory_text=s.advisory_text,
                )
            )

        # 2. Fetch all advisory records
        advisories = (
            db.query(AdvisoryRecord)
            .filter(AdvisoryRecord.farm_id.in_(farm_ids))
            .order_by(AdvisoryRecord.created_at.desc())
            .all()
        )
        for a in advisories:
            farm = farm_map.get(a.farm_id)
            type_title = {
                "irrigation": "💧 Irrigation Prescription",
                "npk": "🧪 NPK Nutrient Advisory",
                "disease": "🔴 Crop Disease Alert",
                "general": "📢 Agronomic Advisory",
            }.get(a.type.lower(), f"🌾 {a.type.capitalize()} Advisory")

            timeline.append(
                HistoryItem(
                    id=f"adv-{a.id}",
                    item_type="advisory",
                    farm_id=a.farm_id,
                    farm_name=farm.name if farm else f"Farm #{a.farm_id}",
                    crop_type=farm.crop_type if farm else "Crop",
                    timestamp=a.created_at,
                    title=type_title,
                    message=a.message,
                    advisory_type=a.type,
                    is_read=a.is_read,
                )
            )

    # 3. Sort combined timeline newest first
    timeline.sort(key=lambda item: item.timestamp, reverse=True)

    leaf_scans_count = sum(1 for item in timeline if item.item_type == "leaf_scan")
    advisories_count = sum(1 for item in timeline if item.item_type == "advisory")

    return FarmerHistoryResponse(
        farmer_id=farmer.id,
        farmer_name=farmer.name,
        total_items=len(timeline),
        leaf_scans_count=leaf_scans_count,
        advisories_count=advisories_count,
        timeline=timeline,
    )
