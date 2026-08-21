from typing import List, Union
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import TelemetryReading, Farm
from app.schemas.schemas import (
    TelemetryReadingCreate,
    TelemetryBatchIngest,
    TelemetryReadingResponse
)

router = APIRouter(prefix="/telemetry", tags=["Telemetry"])


@router.post("/ingest", response_model=List[TelemetryReadingResponse], status_code=status.HTTP_201_CREATED)
def ingest_telemetry(
    payload: Union[TelemetryBatchIngest, List[TelemetryReadingCreate], TelemetryReadingCreate],
    db: Session = Depends(get_db)
):
    """Ingest soil and microclimate telemetry reading batch from mobile sensors or IoT nodes."""
    readings_list: List[TelemetryReadingCreate] = []

    if isinstance(payload, TelemetryBatchIngest):
        readings_list = payload.readings
    elif isinstance(payload, list):
        readings_list = payload
    else:
        readings_list = [payload]

    if not readings_list:
        raise HTTPException(status_code=400, detail="No telemetry readings provided.")

    inserted = []
    for item in readings_list:
        farm = db.query(Farm).filter(Farm.id == item.farm_id).first()
        if not farm:
            continue
        
        db_obj = TelemetryReading(**item.model_dump())
        db.add(db_obj)
        inserted.append(db_obj)

    db.commit()
    for obj in inserted:
        db.refresh(obj)
    
    return inserted


@router.get("/{farm_id}/latest", response_model=TelemetryReadingResponse)
def get_latest_telemetry(farm_id: int, db: Session = Depends(get_db)):
    """Fetch the single most recent telemetry reading for a farm."""
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found.")

    latest = (
        db.query(TelemetryReading)
        .filter(TelemetryReading.farm_id == farm_id)
        .order_by(TelemetryReading.timestamp.desc())
        .first()
    )
    
    if not latest:
        raise HTTPException(status_code=404, detail="No telemetry records found for this farm.")
    
    return latest


@router.get("/{farm_id}/history", response_model=List[TelemetryReadingResponse])
def get_telemetry_history(
    farm_id: int,
    limit: int = 100,
    days: int = 30,
    db: Session = Depends(get_db)
):
    """Retrieve historical telemetry readings for a farm."""
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found.")

    history = (
        db.query(TelemetryReading)
        .filter(TelemetryReading.farm_id == farm_id)
        .order_by(TelemetryReading.timestamp.desc())
        .limit(limit)
        .all()
    )
    return history
