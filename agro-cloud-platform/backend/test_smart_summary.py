import os
import sys
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
os.environ["PYTHONIOENCODING"] = "utf-8"

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_smart_summary_endpoint():
    print("\n=======================================================")
    print(" 1. Testing GET /advisory/1/smart-summary")
    print("=======================================================")
    res = client.get("/advisory/1/smart-summary")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()

    print(f"Farm: {data['farm_name']} (Crop: {data['crop_type']})")
    print(f"Headline: {data['headline']}")
    print(f"Urgency Level: {data['urgency_level']}")
    print(f"\n--- COMBINED SMART SUMMARY TEXT ---")
    print(data["summary_text"])
    print(f"-----------------------------------\n")

    print("PILLAR 1 (Disease):", data["disease"])
    print("PILLAR 2 (Soil/Irrigation):", data["soil_irrigation"])
    print("PILLAR 3 (Market/Mandi):", data["market"])

    assert "summary_text" in data
    assert len(data["summary_text"]) > 20
    assert "disease" in data
    assert "soil_irrigation" in data
    assert "market" in data

    print("\n=======================================================")
    print(" 2. Testing 404 for Non-Existent Farm")
    print("=======================================================")
    res_404 = client.get("/advisory/999999/smart-summary")
    assert res_404.status_code == 404
    print("Non-existent farm gracefully returned 404 Not Found.")

    print("\nSMART SUMMARY BACKEND TESTS PASSED SUCCESSFULLY! [OK]")


if __name__ == "__main__":
    test_smart_summary_endpoint()
