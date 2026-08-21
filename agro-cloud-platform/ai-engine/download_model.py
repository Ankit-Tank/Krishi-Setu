import os
import sys
import importlib
from dotenv import load_dotenv

# Dynamically import ML libraries
torch = None
MobileNetV2ImageProcessor = None
AutoModelForImageClassification = None
AutoImageProcessor = None

try:
    torch = importlib.import_module("torch")
    transformers = importlib.import_module("transformers")
    MobileNetV2ImageProcessor = getattr(transformers, "MobileNetV2ImageProcessor", None)
    AutoModelForImageClassification = getattr(transformers, "AutoModelForImageClassification", None)
    AutoImageProcessor = getattr(transformers, "AutoImageProcessor", None)
except ImportError:
    print("[ERROR] PyTorch and Transformers must be installed in your environment. Run with: .venv\\Scripts\\python.exe download_model.py")
    sys.exit(1)

# Load environment variables
load_dotenv()

model_id = os.getenv("HF_MODEL_ID", "linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification")
hf_token = os.getenv("HF_TOKEN", "").strip() or None

base_dir = os.path.dirname(os.path.abspath(__file__))
save_dir = os.path.join(base_dir, "models", "mobilenet_v2_plant_disease")
os.makedirs(save_dir, exist_ok=True)

print("=======================================================================")
print(f"Downloading Hugging Face Model: {model_id}")
print(f"Local Destination Directory:    {save_dir}")
print(f"Hugging Face Token Configured:  {'YES' if hf_token else 'NO'}")
print("=======================================================================")

try:
    # 1. Download image processor
    print("1. Downloading image processor / feature extractor from Hugging Face...")
    try:
        processor = AutoImageProcessor.from_pretrained(model_id, token=hf_token)
    except Exception:
        processor = MobileNetV2ImageProcessor.from_pretrained(model_id, token=hf_token)
    
    # Save locally to target directory
    processor.save_pretrained(save_dir)
    print(f"   -> Image processor saved to {save_dir}")

    # 2. Download model weights and architecture
    print("2. Downloading model weights and architecture config from Hugging Face...")
    model = AutoModelForImageClassification.from_pretrained(model_id, token=hf_token)
    model.save_pretrained(save_dir)
    print(f"   -> Model weights and config saved to {save_dir}")

    # 3. Verify local offline load
    print("3. Verifying local offline loading from saved directory...")
    loaded_processor = MobileNetV2ImageProcessor.from_pretrained(save_dir, local_files_only=True)
    loaded_model = AutoModelForImageClassification.from_pretrained(save_dir, local_files_only=True)
    loaded_model.eval()

    id2label = loaded_model.config.id2label
    print(f"   -> Offline loading SUCCESSFUL!")
    print(f"   -> Total Class Labels: {len(id2label)}")
    print("=======================================================================")
    print("Full List of Model Class Labels:")
    for idx, label in sorted(id2label.items(), key=lambda x: int(x[0])):
        print(f"   [{int(idx):02d}] {label}")
    print("=======================================================================")

except Exception as e:
    print(f"[ERROR] Failed downloading or verifying model: {e}")
    sys.exit(1)
