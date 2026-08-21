import io
import json
import urllib.request
import urllib.parse
from PIL import Image

BASE_URL = "http://127.0.0.1:8001"


def test_health():
    print("\n--- 1. Health Check (GET /health) ---")
    req = urllib.request.urlopen(f"{BASE_URL}/health")
    res = json.loads(req.read().decode())
    print("Health Status:", res)


def test_disease_detection():
    print("\n--- 2. Plant Disease Detection (POST /predict/disease) ---")
    # Generate a dummy RGB leaf image in memory
    img = Image.new("RGB", (224, 224), color=(34, 139, 34))
    img_bytes = io.BytesIO()
    img.save(img_bytes, format="JPEG")
    img_bytes = img_bytes.getvalue()

    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="test_leaf.jpg"\r\n'
        f"Content-Type: image/jpeg\r\n\r\n"
    ).encode("utf-8") + img_bytes + f"\r\n--{boundary}--\r\n".encode("utf-8")

    req = urllib.request.Request(
        f"{BASE_URL}/predict/disease",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST"
    )
    res = json.loads(urllib.request.urlopen(req).read().decode())
    print("Disease Prediction Result:")
    print("  Disease Name:", res.get("disease_name"))
    print("  Confidence:", res.get("confidence"))
    print("  Recommended Action:", res.get("recommended_action"))
    print("  Source:", res.get("source"))


def test_advisory():
    print("\n--- 3. NPK / Irrigation Advisory Engine (POST /predict/advisory) ---")
    payload = {
        "crop_type": "Wheat",
        "soil_moisture": 24.5,
        "soil_ph": 6.8,
        "nitrogen_ppm": 95.0,
        "phosphorus_ppm": 18.0,
        "potassium_ppm": 115.0,
        "temperature_c": 28.0,
        "humidity_pct": 62.0
    }
    req = urllib.request.Request(
        f"{BASE_URL}/predict/advisory",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    res = json.loads(urllib.request.urlopen(req).read().decode())
    print("Advisory Result:")
    print("  Irrigation Needed:", res.get("irrigation_needed"))
    print("  Irrigation Amount (mm):", res.get("irrigation_amount_mm"))
    print("  NPK Recommendation:", res.get("npk_recommendation"))
    print("  Reasoning:", res.get("reasoning"))


def test_yield_forecast():
    print("\n--- 4. Yield & Harvest Window Forecast (POST /predict/yield-forecast) ---")
    payload = {
        "crop_type": "Wheat",
        "region": "Punjab",
        "planting_date": "2026-05-15",
        "historical_telemetry_summary": {
            "avg_moisture": 32.0,
            "avg_temp": 25.0,
            "avg_ph": 6.8
        }
    }
    req = urllib.request.Request(
        f"{BASE_URL}/predict/yield-forecast",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    res = json.loads(urllib.request.urlopen(req).read().decode())
    print("Yield Forecast Result:")
    print("  Crop / Region:", f"{res.get('crop_type')} ({res.get('region')})")
    print("  Current Growth Stage:", res.get("growth_stage"))
    print("  Projected Harvest Window:", f"{res.get('projected_harvest_start')} to {res.get('projected_harvest_end')}")
    print("  Estimated Yield:", f"{res.get('estimated_yield_quintals_per_acre')} quintals/acre")
    print("  Reasoning:", res.get("reasoning"))


def test_price_forecast():
    print("\n--- 5. 14-Day Mandi Price Forecast (POST /predict/price-forecast) ---")
    payload = {
        "crop_name": "Wheat",
        "mandi_name": "Khanna Mandi",
        "historical_prices": [
            {"date": "2026-08-01", "price": 2300.0},
            {"date": "2026-08-05", "price": 2320.0},
            {"date": "2026-08-10", "price": 2350.0},
            {"date": "2026-08-15", "price": 2380.0},
            {"date": "2026-08-20", "price": 2400.0}
        ]
    }
    req = urllib.request.Request(
        f"{BASE_URL}/predict/price-forecast",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    res = json.loads(urllib.request.urlopen(req).read().decode())
    print("Price Forecast Result:")
    print("  Current Price:", f"INR {res.get('current_price')}")
    print("  14-Day Projected Max Price:", f"INR {res.get('projected_max_price')}")
    print("  Best Time to Sell:", res.get("best_time_to_sell_recommendation"))
    print("  Forecast Sample (First 5 days):", list(zip(res.get("forecast_dates")[:5], res.get("forecast_prices")[:5])))


if __name__ == "__main__":
    test_health()
    test_disease_detection()
    test_advisory()
    test_yield_forecast()
    test_price_forecast()
