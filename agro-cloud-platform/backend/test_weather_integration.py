import os
import sys
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
os.environ["PYTHONIOENCODING"] = "utf-8"
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_weather_endpoints():
    print("\n=======================================================")
    print(" 1. Testing GET /weather by Coordinates (Ludhiana / Punjab)")
    print("=======================================================")
    res = client.get("/weather?lat=30.9010&lon=75.8573&farm_name=Punjab%20Wheat%20Plot")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()

    print(f"City Name: {data['city_name']}, Country: {data['country']}")
    print(f"Current Temp: {data['current']['temp']} deg C (Feels like {data['current']['feels_like']} deg C)")
    print(f"Current Weather: {data['current']['weather_main']} ({data['current']['weather_description']})")
    print(f"Humidity: {data['current']['humidity']}%, Wind: {data['current']['wind_speed']} m/s")
    print(f"Guidance Type: {data['guidance_type']}")
    print(f"Guidance Text: {data['guidance_text']}")
    print(f"5-Day Forecast Days: {len(data['forecast_5d'])}")
    for day in data['forecast_5d']:
        print(f"  - {day['date']} ({day['day_name']}): Min {day['temp_min']} deg C / Max {day['temp_max']} deg C | Rain: {day['rain_prob_pct']}% | {day['weather_description']}")

    assert data["is_live"] is True
    assert "current" in data
    assert len(data["forecast_5d"]) >= 4
    assert "guidance_text" in data
    assert data["guidance_type"] in ["rain_alert", "dry_spell", "wind_alert", "favorable"]

    print("\n=======================================================")
    print(" 2. Testing GET /weather/{farm_id} for Farm #1")
    print("=======================================================")
    res_farm = client.get("/weather/1")
    assert res_farm.status_code == 200, f"Expected 200, got {res_farm.status_code}: {res_farm.text}"
    farm_weather = res_farm.json()
    assert farm_weather["farm_id"] == 1
    print(f"Farm #1 Weather Location: {farm_weather['city_name']}, Temp: {farm_weather['current']['temp']} deg C")

    print("\n=======================================================")
    print(" 3. Testing Farm Location Update & Weather Sync")
    print("=======================================================")
    # Update Farm 1 coordinates to Pune, Maharashtra (18.5204, 73.8567)
    put_res = client.put("/farms/1", json={"latitude": 18.5204, "longitude": 73.8567})
    assert put_res.status_code == 200
    updated_farm = put_res.json()
    assert abs(updated_farm["latitude"] - 18.5204) < 0.01

    # Fetch weather again for Farm 1 and verify coordinates changed
    res_pune = client.get("/weather/1")
    assert res_pune.status_code == 200
    pune_weather = res_pune.json()
    print(f"Updated Farm #1 Location: {pune_weather['city_name']}, Temp: {pune_weather['current']['temp']} deg C")
    assert "pune" in pune_weather["city_name"].lower() or abs(pune_weather["latitude"] - 18.5204) < 0.01

    # Restore Farm 1 to Punjab
    client.put("/farms/1", json={"latitude": 30.9010, "longitude": 75.8573})

    print("\n=======================================================")
    print(" 4. Testing 404 for Non-Existent Farm")
    print("=======================================================")
    res_404 = client.get("/weather/999999")
    assert res_404.status_code == 404
    print("Non-existent farm gracefully returned 404 Not Found.")

    print("\nALL WEATHER INTEGRATION TESTS PASSED SUCCESSFULLY! [OK]")


if __name__ == "__main__":
    test_weather_endpoints()
