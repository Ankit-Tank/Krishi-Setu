import os
import sys
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
os.environ["PYTHONIOENCODING"] = "utf-8"

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_onboarding_wizard_e2e():
    print("\n=======================================================")
    print(" 1. Simulating Onboarding Step 1 & 3: POST /farmers")
    print("=======================================================")
    farmer_payload = {
        "name": "Sukhwinder Singh",
        "phone": "9876543210",
        "preferred_language": "en",
        "region": "Khanna, Ludhiana, Punjab",
        "experience_years": 8,
    }
    res_farmer = client.post("/farmers", json=farmer_payload)
    assert res_farmer.status_code in [200, 201], f"Farmer creation failed: {res_farmer.status_code} {res_farmer.text}"
    created_farmer = res_farmer.json()
    print(f"Created Farmer ID: {created_farmer['id']} | Name: {created_farmer['name']} | Phone: {created_farmer['phone']}")
    assert created_farmer["name"] == "Sukhwinder Singh"
    assert created_farmer["phone"] == "9876543210"
    assert created_farmer["region"] == "Khanna, Ludhiana, Punjab"
    assert created_farmer["experience_years"] == 8

    farmer_id = created_farmer["id"]

    print("\n=======================================================")
    print(" 2. Simulating Onboarding Step 2 & 3: POST /farms")
    print("=======================================================")
    farm_payload = {
        "farmer_id": farmer_id,
        "name": "Sukhwinder GT Road Plot 2",
        "crop_type": "Wheat",
        "area_acres": 6.5,
        "latitude": 30.9010,
        "longitude": 75.8573,
        "irrigation_source": "borewell",
        "preferred_season": "Rabi",
    }
    res_farm = client.post("/farms", json=farm_payload)
    assert res_farm.status_code in [200, 201], f"Farm creation failed: {res_farm.status_code} {res_farm.text}"
    created_farm = res_farm.json()
    print(f"Created Farm ID: {created_farm['id']} | Name: {created_farm['name']} | Crop: {created_farm['crop_type']} | Area: {created_farm['area_acres']} Ac")
    assert created_farm["farmer_id"] == farmer_id
    assert created_farm["name"] == "Sukhwinder GT Road Plot 2"
    assert created_farm["crop_type"] == "Wheat"
    assert created_farm["area_acres"] == 6.5
    assert created_farm["irrigation_source"] == "borewell"
    assert created_farm["preferred_season"] == "Rabi"

    farm_id = created_farm["id"]

    print("\n=======================================================")
    print(" 3. Verifying Advisory & Dashboard Endpoints for New Farm")
    print("=======================================================")
    res_advisory = client.get(f"/advisory/{farm_id}")
    assert res_advisory.status_code == 200, f"Advisory fetch failed: {res_advisory.status_code}"
    adv_data = res_advisory.json()
    print(f"Initial Irrigation Advice: {adv_data['irrigation_advice']}")
    print(f"Initial NPK Advice: {adv_data['npk_advice']}")

    res_summary = client.get(f"/advisory/{farm_id}/smart-summary")
    assert res_summary.status_code == 200, f"Smart summary failed: {res_summary.status_code}"
    summary_data = res_summary.json()
    print(f"Smart Summary Headline: {summary_data['headline']}")
    print(f"Smart Summary Text: {summary_data['summary_text']}")

    print("\n=======================================================")
    print(" ALL ONBOARDING WIZARD E2E TESTS PASSED SUCCESSFULLY! [OK]")
    print("=======================================================")


if __name__ == "__main__":
    test_onboarding_wizard_e2e()
