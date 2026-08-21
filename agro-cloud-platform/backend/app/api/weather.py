from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import Farm
from app.schemas.schemas import WeatherForecastResponse
from app.services.weather_service import WeatherService

router = APIRouter(prefix="/weather", tags=["Live Weather"])


@router.get("/{farm_id}", response_model=WeatherForecastResponse)
async def get_farm_live_weather(
    farm_id: int,
    db: Session = Depends(get_db)
):
    """
    Fetch real live weather & 5-day forecast for a farm's saved GPS location
    using the OpenWeatherMap API and generate real-time agronomic guidance.
    """
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Farm with ID {farm_id} not found."
        )

    # Use saved farm coordinates, or fallback if not set
    lat = farm.latitude if farm.latitude is not None else 30.9010
    lon = farm.longitude if farm.longitude is not None else 75.8573

    try:
        weather_data = await WeatherService.fetch_weather_for_coordinates(
            lat=lat,
            lon=lon,
            farm_id=farm.id,
            farm_name=farm.name
        )
        return weather_data
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to fetch live weather from OpenWeatherMap: {str(e)}"
        )


@router.get("", response_model=WeatherForecastResponse)
async def get_coordinates_live_weather(
    lat: float = Query(..., description="Latitude of the location"),
    lon: float = Query(..., description="Longitude of the location"),
    farm_name: Optional[str] = Query("Field Location", description="Optional farm or area name"),
):
    """
    Fetch real live weather and 5-day forecast directly by latitude and longitude.
    """
    try:
        weather_data = await WeatherService.fetch_weather_for_coordinates(
            lat=lat,
            lon=lon,
            farm_id=0,
            farm_name=farm_name
        )
        return weather_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to fetch live weather: {str(e)}"
        )
