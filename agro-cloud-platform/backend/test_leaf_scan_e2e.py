import os
import sys
import io
from PIL import Image

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
os.environ["PYTHONIOENCODING"] = "utf-8"

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_leaf_scan_and_result_structure():
    print("\n=======================================================")
    print(" 1. Testing POST /leaf-scans/ with Real Leaf Image File")
    print("=======================================================")

    # Generate a sample green RGB leaf image
    img = Image.new("RGB", (224, 224), color=(46, 125, 50))
    img_bytes = io.BytesIO()
    img.save(img_bytes, format="JPEG")
    img_bytes.seek(0)

    files = {
        "file": ("sample_leaf.jpg", img_bytes.getvalue(), "image/jpeg")
    }
    data = {
        "farm_id": "1"
    }

    res = client.post("/leaf-scan/upload", data=data, files=files)
    assert res.status_code in [200, 201], f"Leaf scan upload failed: {res.status_code} {res.text}"
    scan_data = res.json()

    print(f"Scan ID: {scan_data['id']}")
    print(f"Predicted Disease: {scan_data['predicted_disease']}")
    print(f"Confidence Score: {scan_data['confidence_score']}")
    print(f"Advisory Text: {scan_data['advisory_text']}")
    print(f"Image URL: {scan_data['image_url']}")

    assert "predicted_disease" in scan_data
    assert "confidence_score" in scan_data
    assert "advisory_text" in scan_data

    # Verify structured parsing compatibility
    disease = scan_data["predicted_disease"]
    advisory_text = scan_data["advisory_text"]
    conf = scan_data["confidence_score"]

    print("\n=======================================================")
    print(" 2. Simulating New Crop Doctor UI Section Formatting")
    print("=======================================================")
    is_healthy = "healthy" in disease.lower()
    status_level = "HEALTHY" if is_healthy else ("WARNING" if "blight" in disease.lower() or "mildew" in disease.lower() else "CRITICAL")
    icon = "🌿" if is_healthy else ("⚠️" if status_level == "WARNING" else "🚨")

    print(f"Section 1 Status Banner: [{icon} {status_level}]")
    print(f"Section 2 Disease Name: {disease}")
    print(f"Section 3 Advisory Actions: {advisory_text}")
    print(f"Section 4 Subtle Model Confidence: {round(conf * 100)}%")

    print("\n=======================================================")
    print(" LEAF SCAN END-TO-END TEST PASSED SUCCESSFULLY! [OK]")
    print("=======================================================")


if __name__ == "__main__":
    test_leaf_scan_and_result_structure()
