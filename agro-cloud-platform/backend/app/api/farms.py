from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import Farm, Farmer, TelemetryReading
from app.schemas.schemas import FarmCreate, FarmUpdate, FarmResponse

router = APIRouter(prefix="/farms", tags=["Farms"])


@router.post("", response_model=FarmResponse, status_code=status.HTTP_201_CREATED)
def create_farm(payload: FarmCreate, db: Session = Depends(get_db)):
    """Create a new farm plot under a farmer and auto-seed initial telemetry reading."""
    farmer = db.query(Farmer).filter(Farmer.id == payload.farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found.")
    
    farm = Farm(**payload.model_dump())
    db.add(farm)
    db.commit()
    db.refresh(farm)

    # Auto-seed initial simulated telemetry for the newly created farm
    initial_telemetry = TelemetryReading(
        farm_id=farm.id,
        soil_moisture=26.5,
        soil_ph=6.8,
        temperature_c=25.0,
        humidity_pct=60.0,
        nitrogen_ppm=105,
        phosphorus_ppm=45,
        potassium_ppm=180
    )
    db.add(initial_telemetry)
    db.commit()

    return farm


@router.get("", response_model=List[FarmResponse])
def list_farms(farmer_id: int = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List farms, optionally filtered by farmer_id."""
    query = db.query(Farm)
    if farmer_id:
        query = query.filter(Farm.farmer_id == farmer_id)
    return query.offset(skip).limit(limit).all()


@router.get("/{farm_id}", response_model=FarmResponse)
def get_farm(farm_id: int, db: Session = Depends(get_db)):
    """Get farm by ID."""
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found.")
    return farm


@router.put("/{farm_id}", response_model=FarmResponse)
def update_farm(farm_id: int, payload: FarmUpdate, db: Session = Depends(get_db)):
    """Update farm parameters."""
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found.")
    
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(farm, key, value)
    
    db.commit()
    db.refresh(farm)
    return farm


@router.delete("/{farm_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_farm(farm_id: int, db: Session = Depends(get_db)):
    """Delete a farm plot."""
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found.")
    db.delete(farm)
    db.commit()
    return None
