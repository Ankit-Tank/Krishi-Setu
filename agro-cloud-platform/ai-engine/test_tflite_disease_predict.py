import json
import urllib.request
import io
from PIL import Image, ImageDraw

AI_ENGINE_URL = "http://127.0.0.1:8500"


def create_sample_leaf_image() -> bytes:
    """Create a realistic sample leaf image in memory."""
    img = Image.new("RGB", (300, 300), color=(40, 140, 45))
    draw = ImageDraw.Draw(img)
    # Draw leaf vein & spot patterns
    draw.ellipse([60, 60, 240, 240], fill=(30, 120, 35), outline=(20, 90, 25))
    draw.ellipse([100, 110, 140, 150], fill=(139, 69, 19)) # Necrotic brown spot
    draw.ellipse([160, 170, 190, 200], fill=(160, 82, 45)) # Necrotic spot 2
    
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def test_tflite_disease_prediction():
    image_bytes = create_sample_leaf_image()

    print("=======================================================================")
    print("Testing /predict/disease endpoint on AI Engine (Port 8500)")
    print("=======================================================================")

    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    body = bytearray()
    body.extend(f"--{boundary}\r\n".encode())
    body.extend(b'Content-Disposition: form-data; name="file"; filename="test_leaf.jpg"\r\n')
    body.extend(b'Content-Type: image/jpeg\r\n\r\n')
    body.extend(image_bytes)
    body.extend(b'\r\n')
    body.extend(f"--{boundary}--\r\n".encode())

    req = urllib.request.Request(
        f"{AI_ENGINE_URL}/predict/disease",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST"
    )

    try:
        response = urllib.request.urlopen(req)
        result = json.loads(response.read().decode("utf-8"))
        print("\nPrediction Response JSON:")
        print(json.dumps(result, indent=2))
        print("\n-----------------------------------------------------------------------")
        print(f"[SUCCESS] Prediction Source Tier: {result.get('source')}")
        print(f"[SUCCESS] Disease Diagnosis:    {result.get('disease_name')}")
        print(f"[SUCCESS] Confidence Score:     {result.get('confidence')}")
        print(f"[SUCCESS] Recommended Action:   {result.get('recommended_action')}")
        print("-----------------------------------------------------------------------")
    except Exception as e:
        print(f"[ERROR] Error testing /predict/disease: {e}")


if __name__ == "__main__":
    test_tflite_disease_prediction()
