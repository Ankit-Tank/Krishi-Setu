import os
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
os.environ["PYTHONIOENCODING"] = "utf-8"

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_dashboard_endpoints():
    print("\n=======================================================")
    print(" 1. Verifying Farmer & Farm Data for Dashboard")
    print("=======================================================")
    res_farmer = client.get("/farmers/1")
    assert res_farmer.status_code == 200, f"Farmer 1 fetch failed: {res_farmer.status_code}"
    farmer = res_farmer.json()
    print(f"Farmer: {farmer['name']}, Region: {farmer['region']}")

    res_farms = client.get("/farms?farmer_id=1")
    assert res_farms.status_code == 200, f"Farms fetch failed: {res_farms.status_code}"
    farms = res_farms.json()
    assert len(farms) > 0, "Expected at least 1 farm"
    farm_id = farms[0]["id"]
    print(f"Primary Farm: {farms[0]['name']} (ID: {farm_id}, Crop: {farms[0]['crop_type']})")

    print("\n=======================================================")
    print(" 2. Verifying AI Smart Summary Endpoint")
    print("=======================================================")
    res_summary = client.get(f"/advisory/{farm_id}/smart-summary")
    assert res_summary.status_code == 200, f"Smart summary failed: {res_summary.status_code}"
    summary = res_summary.json()
    print(f"Headline: {summary['headline']}")
    print(f"Summary: {summary['summary_text']}")
    print(f"Urgency Level: {summary['urgency_level']}")
    assert "disease" in summary
    assert "soil_irrigation" in summary
    assert "market" in summary

    print("\n=======================================================")
    print(" 3. Verifying Live Weather Endpoint")
    print("=======================================================")
    res_weather = client.get(f"/weather/{farm_id}")
    assert res_weather.status_code == 200, f"Weather failed: {res_weather.status_code}"
    weather = res_weather.json()
    print(f"City: {weather.get('city_name')}, Temp: {weather['current']['temp']}°C, Is Live: {weather['is_live']}")
    print(f"Forecast Days Count: {len(weather['forecast_5d'])}")
    print(f"Guidance Text: {weather['guidance_text']}")

    print("\n=======================================================")
    print(" 4. Verifying Telemetry & Advisory Endpoints")
    print("=======================================================")
    res_telemetry = client.get(f"/telemetry/{farm_id}/latest")
    assert res_telemetry.status_code == 200, f"Telemetry failed: {res_telemetry.status_code}"
    telemetry = res_telemetry.json()
    print(f"Telemetry -> Soil Moisture: {telemetry['soil_moisture']}%, Temp: {telemetry['temperature_c']}°C")

    res_adv = client.get(f"/advisory/{farm_id}")
    assert res_adv.status_code == 200, f"Advisories failed: {res_adv.status_code}"
    adv_data = res_adv.json()
    print(f"Advisories count: {len(adv_data.get('advisory_records', []))}")

    print("\n=======================================================")
    print(" DASHBOARD ENDPOINTS & DATA INTEGRITY VERIFIED! [OK]")
    print("=======================================================")


if __name__ == "__main__":
    test_dashboard_endpoints()
