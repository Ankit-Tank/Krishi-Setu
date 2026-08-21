import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.config import settings
from app.models.models import Farm, TelemetryReading, AdvisoryRecord
from app.schemas.schemas import RuleBasedAdvisoryResponse, SmartSummaryResponse
from app.services.agronomic_advisor import AgronomicAdvisor
from app.services.smart_summary_service import SmartSummaryService

router = APIRouter(prefix="/advisory", tags=["Advisory"])


@router.get("/{farm_id}/smart-summary", response_model=SmartSummaryResponse)
def get_farm_smart_summary(farm_id: int, db: Session = Depends(get_db)):
    """
    Generate an all-in-one AI Smart Summary synthesizing the farmer's latest disease
    scan result, soil moisture/irrigation status, and top mandi market match.
    """
    try:
        return SmartSummaryService.generate_smart_summary(farm_id, db)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate smart summary: {str(e)}")


@router.get("/{farm_id}", response_model=RuleBasedAdvisoryResponse)
async def get_farm_advisory(farm_id: int, db: Session = Depends(get_db)):
    """
    Retrieve precision NPK, irrigation, and soil pH advisory for a farm by querying the
    AI Engine microservice (/predict/advisory) with the farm's latest telemetry reading,
    plus all historical advisory records.
    """
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found.")

    latest_telemetry = (
        db.query(TelemetryReading)
        .filter(TelemetryReading.farm_id == farm_id)
        .order_by(TelemetryReading.timestamp.desc())
        .first()
    )

    # Default local agronomic evaluation fallback
    eval_result = AgronomicAdvisor.evaluate(farm, latest_telemetry)

    # Call AI Engine microservice if telemetry exists
    if latest_telemetry:
        ai_url = f"{settings.AI_ENGINE_URL}/predict/advisory"
        payload = {
            "crop_type": farm.crop_type,
            "soil_moisture": latest_telemetry.soil_moisture,
            "soil_ph": latest_telemetry.soil_ph,
            "nitrogen_ppm": latest_telemetry.nitrogen_ppm,
            "phosphorus_ppm": latest_telemetry.phosphorus_ppm,
            "potassium_ppm": latest_telemetry.potassium_ppm,
            "temperature_c": latest_telemetry.temperature_c,
            "humidity_pct": latest_telemetry.humidity_pct
        }

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                response = await client.post(ai_url, json=payload)
                if response.status_code == 200:
                    ai_data = response.json()
                    irr_needed = ai_data.get("irrigation_needed", False)
                    irr_amt = ai_data.get("irrigation_amount_mm", 0.0)
                    npk_rec = ai_data.get("npk_recommendation", "")
                    reasoning = ai_data.get("reasoning", "")

                    if irr_needed:
                        eval_result["irrigation_advice"] = (
                            f"[AI Engine] IRRIGATION NEEDED: Apply {irr_amt}mm water. Reasoning: {reasoning}"
                        )
                    else:
                        eval_result["irrigation_advice"] = f"[AI Engine] OPTIMAL MOISTURE: {reasoning}"

                    eval_result["npk_advice"] = f"[AI Engine] NPK Recommendation: {npk_rec}"
        except Exception as e:
            print(f"[Backend Warning] AI Engine advisory endpoint at {ai_url} unreachable: {e}. Using local advisor.")

    records = (
        db.query(AdvisoryRecord)
        .filter(AdvisoryRecord.farm_id == farm_id)
        .order_by(AdvisoryRecord.created_at.desc())
        .all()
    )

    return RuleBasedAdvisoryResponse(
        farm_id=farm.id,
        crop_type=farm.crop_type,
        latest_telemetry=latest_telemetry,
        irrigation_advice=eval_result["irrigation_advice"],
        npk_advice=eval_result["npk_advice"],
        ph_advice=eval_result["ph_advice"],
        advisory_records=records
    )
