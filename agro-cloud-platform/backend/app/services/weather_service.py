import asyncio
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from collections import defaultdict
import httpx
from app.core.config import settings
from app.schemas.schemas import (
    CurrentWeather,
    ForecastDay,
    WeatherForecastResponse,
)

OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5"


def _format_day_name(date_str: str, today_date_str: str) -> str:
    """Format date string (YYYY-MM-DD) into Today, Tomorrow, or 3-letter day name."""
    try:
        target_dt = datetime.strptime(date_str, "%Y-%m-%d").date()
        today_dt = datetime.strptime(today_date_str, "%Y-%m-%d").date()
        delta_days = (target_dt - today_dt).days

        if delta_days == 0:
            return "Today"
        elif delta_days == 1:
            return "Tomorrow"
        else:
            return target_dt.strftime("%a")  # e.g., 'Mon', 'Tue'
    except Exception:
        return date_str


def _generate_agronomic_guidance(
    current: CurrentWeather,
    forecast_days: List[ForecastDay]
) -> tuple[str, str]:
    """
    Generate practical, short guidance text based on current & upcoming 5-day weather conditions.
    Returns (guidance_text, guidance_type).
    """
    # Check immediate next 48 hours (first 2 forecast days)
    next_48h = forecast_days[:2]
    total_rain_48h = sum(d.rain_mm for d in next_48h)
    max_rain_prob_48h = max((d.rain_prob_pct for d in next_48h), default=0)
    has_heavy_rain_or_storm = any(
        d.weather_main in ["Thunderstorm", "Squall", "Tornado"] or d.rain_mm >= 15.0
        for d in next_48h
    )

    # 1. Heavy rain / storm warning
    if has_heavy_rain_or_storm:
        return (
            f"⛈️ Heavy rain & storm expected (~{total_rain_48h:.1f} mm) — ensure field drainage channels are open and postpone fertilizer application.",
            "rain_alert"
        )

    # 2. Rain expected in 24-48 hours
    if max_rain_prob_48h >= 40 or total_rain_48h >= 2.0 or current.weather_main == "Rain":
        rain_str = f" (~{total_rain_48h:.1f} mm)" if total_rain_48h > 0 else ""
        return (
            f"🌧️ Rain expected in next 24-48 hours{rain_str} — hold off on irrigation, fertilizer top-dressing, and chemical spraying.",
            "rain_alert"
        )

    # 3. High winds
    if current.wind_speed >= 7.0:  # ~25 km/h
        return (
            f"💨 Gusty winds detected ({current.wind_speed:.1f} m/s) — postpone foliar and pesticide spraying to prevent chemical drift.",
            "wind_alert"
        )

    # 4. Dry spell / heat warning
    hot_days = [d for d in forecast_days if d.temp_max >= 34.0]
    if len(hot_days) >= 2 and total_rain_48h < 1.0:
        max_temp = max((d.temp_max for d in forecast_days), default=35.0)
        return (
            f"☀️ Dry spell and high temperatures ahead (up to {max_temp:.0f}°C) — consider irrigating soon to maintain root zone moisture.",
            "dry_spell"
        )

    # 5. High humidity & warm (fungal risk)
    if current.humidity >= 85 and current.temp >= 22.0:
        return (
            "🌫️ High humidity & warmth — monitor crops closely for early fungal blight or rust symptoms.",
            "favorable"
        )

    # 6. Default favorable weather
    return (
        "⛅ Favorable weather conditions ahead — optimal window for weeding, intercultural operations, and field scouting.",
        "favorable"
    )


class WeatherService:
    @staticmethod
    async def fetch_weather_for_coordinates(
        lat: float,
        lon: float,
        farm_id: int = 1,
        farm_name: str = "Farm Plot"
    ) -> WeatherForecastResponse:
        """Fetch current weather and 5-day forecast from OpenWeatherMap."""
        api_key = settings.OPENWEATHER_API_KEY
        if not api_key:
            raise ValueError("OPENWEATHER_API_KEY is not configured in backend/.env")

        headers = {"Accept": "application/json"}
        current_url = f"{OPENWEATHER_BASE_URL}/weather"
        forecast_url = f"{OPENWEATHER_BASE_URL}/forecast"
        params = {
            "lat": lat,
            "lon": lon,
            "appid": api_key,
            "units": "metric",
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            current_resp, forecast_resp = await asyncio.gather(
                client.get(current_url, params=params, headers=headers),
                client.get(forecast_url, params=params, headers=headers),
                return_exceptions=True
            )

        if isinstance(current_resp, Exception) or current_resp.status_code != 200:
            error_detail = (
                str(current_resp) if isinstance(current_resp, Exception)
                else f"OpenWeatherMap current weather failed with status {current_resp.status_code}"
            )
            raise RuntimeError(error_detail)

        if isinstance(forecast_resp, Exception) or forecast_resp.status_code != 200:
            error_detail = (
                str(forecast_resp) if isinstance(forecast_resp, Exception)
                else f"OpenWeatherMap forecast failed with status {forecast_resp.status_code}"
            )
            raise RuntimeError(error_detail)

        curr_data = current_resp.json()
        fore_data = forecast_resp.json()

        # Parse Current Weather
        main_weather = (curr_data.get("weather") or [{}])[0]
        rain_1h = 0.0
        if "rain" in curr_data and isinstance(curr_data["rain"], dict):
            rain_1h = float(curr_data["rain"].get("1h", 0.0))

        current_weather = CurrentWeather(
            temp=round(float(curr_data.get("main", {}).get("temp", 25.0)), 1),
            feels_like=round(float(curr_data.get("main", {}).get("feels_like", 25.0)), 1),
            temp_min=round(float(curr_data.get("main", {}).get("temp_min", 20.0)), 1),
            temp_max=round(float(curr_data.get("main", {}).get("temp_max", 30.0)), 1),
            humidity=int(curr_data.get("main", {}).get("humidity", 50)),
            pressure=int(curr_data.get("main", {}).get("pressure", 1013)),
            wind_speed=round(float(curr_data.get("wind", {}).get("speed", 2.0)), 1),
            wind_deg=curr_data.get("wind", {}).get("deg"),
            weather_main=main_weather.get("main", "Clear"),
            weather_description=main_weather.get("description", "clear sky").title(),
            icon=main_weather.get("icon", "01d"),
            rain_1h_mm=rain_1h,
            clouds_pct=int(curr_data.get("clouds", {}).get("all", 0)),
        )

        # Aggregate 3-Hour Forecast list into Daily Forecast (up to 5 days)
        # Groups: date_str (YYYY-MM-DD) -> list of 3-hour slices
        grouped_by_date = defaultdict(list)
        for item in fore_data.get("list", []):
            dt_txt = item.get("dt_txt", "")
            if len(dt_txt) >= 10:
                date_str = dt_txt[:10]
                grouped_by_date[date_str].append(item)

        today_date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        daily_forecasts: List[ForecastDay] = []

        # Sort dates chronologically and take up to 5 days
        sorted_dates = sorted(grouped_by_date.keys())[:5]
        for d_str in sorted_dates:
            slices = grouped_by_date[d_str]
            temps = [s.get("main", {}).get("temp", 25.0) for s in slices]
            humidities = [s.get("main", {}).get("humidity", 50) for s in slices]
            pops = [s.get("pop", 0.0) for s in slices]
            rain_amounts = [
                float(s.get("rain", {}).get("3h", 0.0))
                for s in slices if isinstance(s.get("rain"), dict)
            ]

            # Find midday slice or dominant weather condition
            mid_slice = slices[len(slices) // 2]
            # If any slice has Rain/Thunderstorm, prioritize showing that
            rain_slice = next(
                (s for s in slices if (s.get("weather") or [{}])[0].get("main") in ["Rain", "Thunderstorm", "Drizzle"]),
                None
            )
            selected_slice = rain_slice or mid_slice
            selected_weather = (selected_slice.get("weather") or [{}])[0]

            daily_forecasts.append(
                ForecastDay(
                    date=d_str,
                    day_name=_format_day_name(d_str, today_date_str),
                    temp_min=round(float(min(temps)), 1),
                    temp_max=round(float(max(temps)), 1),
                    temp_day=round(float(sum(temps) / len(temps)), 1),
                    humidity=int(sum(humidities) / len(humidities)),
                    rain_prob_pct=int(max(pops, default=0.0) * 100),
                    rain_mm=round(float(sum(rain_amounts)), 1),
                    weather_main=selected_weather.get("main", "Clear"),
                    weather_description=selected_weather.get("description", "clear sky").title(),
                    icon=selected_weather.get("icon", "01d"),
                )
            )

        # Generate guidance text based on conditions
        guidance_text, guidance_type = _generate_agronomic_guidance(current_weather, daily_forecasts)

        city_name = curr_data.get("name") or fore_data.get("city", {}).get("name") or "Local Field Area"
        country = curr_data.get("sys", {}).get("country") or fore_data.get("city", {}).get("country") or "IN"

        return WeatherForecastResponse(
            farm_id=farm_id,
            farm_name=farm_name,
            city_name=city_name,
            country=country,
            latitude=lat,
            longitude=lon,
            is_live=True,
            current=current_weather,
            forecast_5d=daily_forecasts,
            guidance_text=guidance_text,
            guidance_type=guidance_type,
            fetched_at=datetime.now(timezone.utc).isoformat(),
        )
