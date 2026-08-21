import json
import urllib.request
import urllib.parse

BACKEND_URL = "http://127.0.0.1:8080"


def print_header(title):
    print("\n=======================================================")
    print(f" {title}")
    print("=======================================================")


def test_full_farm_to_market_flow():
    print_header("1. Create New Trade Listing (POST /market/trade-listing)")
    listing_payload = {
        "farmer_id": 1,
        "crop_type": "Wheat",
        "quantity_quintals": 60.0,
        "harvest_date": "2026-08-28"
    }

    req = urllib.request.Request(
        f"{BACKEND_URL}/market/trade-listing",
        data=json.dumps(listing_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    res_raw = urllib.request.urlopen(req).read().decode()
    listing_res = json.loads(res_raw)
    listing_id = listing_res["id"]
    print("Created Trade Listing:")
    print(json.dumps(listing_res, indent=2))

    print_header(f"2. Fetch Ranked Buyer Matches (GET /market/matches/{listing_id})")
    req = urllib.request.urlopen(f"{BACKEND_URL}/market/matches/{listing_id}")
    matches = json.loads(req.read().decode())
    print(f"Retrieved {len(matches)} Ranked Buyer Matches:")
    print(json.dumps(matches, indent=2))

    if not matches:
        print("ERROR: No matches returned.")
        return

    top_match = matches[0]
    top_match_id = top_match["id"]

    print_header(f"3. Confirm Trade Listing & Provision Logistics (POST /market/trade-listing/{listing_id}/confirm)")
    confirm_payload = {
        "buyer_match_id": top_match_id
    }

    req = urllib.request.Request(
        f"{BACKEND_URL}/market/trade-listing/{listing_id}/confirm",
        data=json.dumps(confirm_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    confirm_res = json.loads(urllib.request.urlopen(req).read().decode())
    print("Trade Confirmation & Logistics Record:")
    print(json.dumps(confirm_res, indent=2))


if __name__ == "__main__":
    test_full_farm_to_market_flow()
