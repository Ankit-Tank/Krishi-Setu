import os
import sys
import time
from io import StringIO
from contextlib import redirect_stdout

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
os.environ["PYTHONIOENCODING"] = "utf-8"

from fastapi.testclient import TestClient
from app.main import app
from app.services.weather_service import WeatherService, _WEATHER_CACHE, CACHE_TTL_SECONDS

client = TestClient(app)


def test_weather_caching():
    print("\n=======================================================")
    print(" 1. Initial Call: Expecting Cache Miss & Fresh API Call")
    print("=======================================================")
    WeatherService.clear_cache()
    assert len(_WEATHER_CACHE) == 0

    stdout_capture = StringIO()
    with redirect_stdout(stdout_capture):
        res1 = client.get("/weather/1")
    output1 = stdout_capture.getvalue()
    print(output1)
    
    assert res1.status_code == 200, f"Expected 200, got {res1.status_code}: {res1.text}"
    data1 = res1.json()
    assert "Cache miss" in output1 or "Calling OpenWeatherMap API" in output1
    assert "farm_1" in _WEATHER_CACHE
    print(f"Weather fetched for: {data1['city_name']} ({data1['current']['temp']} deg C)")

    print("\n=======================================================")
    print(" 2. Immediate Second Call: Expecting Cache HIT ('used cache')")
    print("=======================================================")
    stdout_capture2 = StringIO()
    with redirect_stdout(stdout_capture2):
        res2 = client.get("/weather/1")
    output2 = stdout_capture2.getvalue()
    print(output2)

    assert res2.status_code == 200
    data2 = res2.json()
    assert "used cache" in output2, "Output MUST contain 'used cache' on second call!"
    assert "Calling OpenWeatherMap API" not in output2, "Should NOT have called external API on cache hit!"
    assert data1["fetched_at"] == data2["fetched_at"], "Timestamps should match on cached response"
    print("SUCCESS: Terminal confirmed 'used cache' on second load.")

    print("\n=======================================================")
    print(" 3. Multiple Consecutive Calls: All Use Cache")
    print("=======================================================")
    for i in range(3):
        stdout_cap = StringIO()
        with redirect_stdout(stdout_cap):
            res_repeat = client.get("/weather/1")
        assert res_repeat.status_code == 200
        assert "used cache" in stdout_cap.getvalue()
    print("SUCCESS: 3 consecutive calls all used in-memory cache without hitting OpenWeatherMap.")

    print("\n=======================================================")
    print(" 4. Coordinate Route GET /weather?lat=...&lon=... Caching")
    print("=======================================================")
    stdout_coords1 = StringIO()
    with redirect_stdout(stdout_coords1):
        res_coords1 = client.get("/weather?lat=28.7041&lon=77.1025&farm_name=Delhi%20Plot")
    print(stdout_coords1.getvalue())
    assert res_coords1.status_code == 200

    stdout_coords2 = StringIO()
    with redirect_stdout(stdout_coords2):
        res_coords2 = client.get("/weather?lat=28.7041&lon=77.1025&farm_name=Delhi%20Plot")
    print(stdout_coords2.getvalue())
    assert res_coords2.status_code == 200
    assert "used cache" in stdout_coords2.getvalue()
    print("SUCCESS: Direct coordinate route also accurately uses cache.")

    print("\n=======================================================")
    print(" 5. Cache Expiration After 30 Minutes (Simulated)")
    print("=======================================================")
    # Manually age the cache entry by 31 minutes
    _WEATHER_CACHE["farm_1"]["timestamp"] = time.time() - (31 * 60)
    stdout_exp = StringIO()
    with redirect_stdout(stdout_exp):
        res_exp = client.get("/weather/1")
    output_exp = stdout_exp.getvalue()
    print(output_exp)
    assert res_exp.status_code == 200
    assert "expired" in output_exp or "Cache expired" in output_exp
    print("SUCCESS: Expired cache correctly triggers a fresh API call.")

    print("\nALL WEATHER CACHE TESTS PASSED SUCCESSFULLY! [OK]\n")


if __name__ == "__main__":
    test_weather_caching()
