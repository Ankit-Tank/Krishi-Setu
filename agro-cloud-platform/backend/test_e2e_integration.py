import io
import json
import urllib.request
from PIL import Image

BACKEND_URL = "http://127.0.0.1:8080"


def print_section(title):
    print("\n=======================================================")
    print(f" {title}")
    print("=======================================================")


def test_e2e_leaf_scan_upload():
    print_section("1. POST /leaf-scan/upload (Backend -> AI Engine Disease Predict)")
    
    # Generate test leaf image in memory
    img = Image.new("RGB", (224, 224), color=(34, 139, 34))
    img_bytes = io.BytesIO()
    img.save(img_bytes, format="JPEG")
    raw_bytes = img_bytes.getvalue()

    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="farm_id"\r\n\r\n'
        f"1\r\n"
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="sample_wheat_leaf.jpg"\r\n'
        f"Content-Type: image/jpeg\r\n\r\n"
    ).encode("utf-8") + raw_bytes + f"\r\n--{boundary}--\r\n".encode("utf-8")

    req = urllib.request.Request(
        f"{BACKEND_URL}/leaf-scan/upload",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST"
    )

    res_raw = urllib.request.urlopen(req).read().decode()
    res_json = json.loads(res_raw)
    print("Response JSON:")
    print(json.dumps(res_json, indent=2))
    return res_json


def test_e2e_farm_advisory():
    print_section("2. GET /advisory/1 (Backend -> AI Engine NPK/Irrigation Advisory)")
    req = urllib.request.urlopen(f"{BACKEND_URL}/advisory/1")
    res_json = json.loads(req.read().decode())
    print("Response JSON:")
    print(json.dumps(res_json, indent=2))
    return res_json


def test_e2e_yield_forecast():
    print_section("3. GET /market/yield-forecast/1 (Backend -> AI Engine Yield Forecast)")
    req = urllib.request.urlopen(f"{BACKEND_URL}/market/yield-forecast/1")
    res_json = json.loads(req.read().decode())
    print("Response JSON:")
    print(json.dumps(res_json, indent=2))
    return res_json


def test_e2e_price_forecast():
    print_section("4. GET /market/price-forecast (Backend -> AI Engine 14-Day Price Forecast)")
    url = f"{BACKEND_URL}/market/price-forecast?crop=Wheat&mandi=Khanna%20Mandi"
    req = urllib.request.urlopen(url)
    res_json = json.loads(req.read().decode())
    print("Response JSON:")
    print(json.dumps(res_json, indent=2))
    return res_json


if __name__ == "__main__":
    test_e2e_leaf_scan_upload()
    test_e2e_farm_advisory()
    test_e2e_yield_forecast()
    test_e2e_price_forecast()
