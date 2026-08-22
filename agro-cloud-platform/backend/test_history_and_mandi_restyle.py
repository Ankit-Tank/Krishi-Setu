import os
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
os.environ["PYTHONIOENCODING"] = "utf-8"

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_history_and_mandi_data_integrity():
    print("\n=======================================================")
    print(" 1. Testing Mandi Trade Listing & Buyer Matches Data")
    print("=======================================================")
    listing_payload = {
        "farmer_id": 1,
        "crop_type": "Wheat",
        "quantity_quintals": 45.0,
        "harvest_date": "2026-08-22"
    }
    res_list = client.post("/market/trade-listing", json=listing_payload)
    assert res_list.status_code in [200, 201], f"Create listing failed: {res_list.status_code}"
    listing_data = res_list.json()
    listing_id = listing_data["id"]
    print(f"Created Trade Listing ID: {listing_id} for {listing_data['crop_type']} ({listing_data['quantity_quintals']} qtl)")

    res_matches = client.get(f"/market/matches/{listing_id}")
    assert res_matches.status_code == 200, f"Get matches failed: {res_matches.status_code}"
    matches = res_matches.json()
    assert len(matches) > 0, "Expected at least 1 buyer match"
    print(f"Found {len(matches)} AI Ranked Buyer Matches:")

    top_match = matches[0]
    print(f"\n--- TOP-RANKED MATCH (RANK #1) ---")
    print(f"  🏢 Buyer: {top_match['buyer_name']}")
    print(f"  💰 Offered Price: ₹{top_match['offered_price']}/qtl")
    print(f"  📍 Mandi & Distance: {top_match['mandi_name']} ({top_match['distance_km']} km)")
    print(f"  💡 Match Reasoning: {top_match.get('explanation')}")
    print(f"  🚚 Logistics: {top_match.get('logistics_note')}")
    print(f"  ⭐ AI Match Score: {top_match.get('score')}")

    assert "offered_price" in top_match
    assert "distance_km" in top_match
    assert "explanation" in top_match
    assert "logistics_note" in top_match

    print("\n=======================================================")
    print(" 2. Testing Farmer History Timeline Data")
    print("=======================================================")
    res_history = client.get("/farmers/1/history")
    assert res_history.status_code == 200, f"History fetch failed: {res_history.status_code}"
    history_data = res_history.json()
    timeline = history_data.get("timeline", [])
    print(f"Farmer History: {history_data['farmer_name']} (Total Events: {len(timeline)})")

    for idx, item in enumerate(timeline[:5]):
        item_type = item["item_type"]
        icon = "🔬" if item_type == "leaf_scan" else "📢"
        name = item.get("predicted_disease") or item.get("title")
        print(f"  [{idx+1}] {icon} ({item['timestamp'][:19]}) {name} @ {item.get('farm_name')}")
        assert "timestamp" in item
        assert "item_type" in item

    print("\n=======================================================")
    print(" MANDI & HISTORY RESTYLE DATA TESTS PASSED! [OK]")
    print("=======================================================")


if __name__ == "__main__":
    test_history_and_mandi_data_integrity()
