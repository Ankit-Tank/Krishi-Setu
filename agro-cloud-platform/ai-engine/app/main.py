from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.schemas.schemas import (
    DiseasePredictResponse,
    AdvisoryPredictRequest,
    AdvisoryPredictResponse,
    YieldForecastRequest,
    YieldForecastResponse,
    PriceForecastRequest,
    PriceForecastResponse,
)
from app.services.disease_detector import DiseaseDetectorService
from app.services.agri_advisor import AgriAdvisorService
from app.services.yield_forecaster import YieldAndMarketForecaster

app = FastAPI(
    title=settings.AI_SERVICE_NAME,
    description=(
        "Agro-Cloud AI & ML Engine Microservice. "
        "Provides inference endpoints for plant disease detection (Hugging Face / Vision Fallback), "
        "transparent rule-based NPK/irrigation advisory, harvest yield window forecasting, "
        "and 14-day Mandi price forecasting."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
def root():
    return {
        "service": settings.AI_SERVICE_NAME,
        "status": "ready",
        "capabilities": [
            "1. Plant Disease Detection (POST /predict/disease)",
            "2. NPK / Irrigation Advisory Engine (POST /predict/advisory)",
            "3. Yield Window Forecasting (POST /predict/yield-forecast)",
            "4. 14-Day Mandi Price Forecasting (POST /predict/price-forecast)"
        ],
        "docs": "/docs"
    }


@app.get("/health", tags=["Health"])
def health():
    return {
        "status": "ok",
        "service": settings.AI_SERVICE_NAME,
        "port": settings.AI_SERVICE_PORT,
        "hf_model": settings.HF_MODEL_ID,
        "hf_token_configured": bool(settings.HF_TOKEN)
    }


# ----------------------------------------------------
# 1. PLANT DISEASE DETECTION
# ----------------------------------------------------
@app.post("/predict/disease", response_model=DiseasePredictResponse, tags=["Inference"])
async def predict_disease(file: UploadFile = File(...)):
    """
    Accepts an uploaded leaf image file.
    Queries HuggingFace Inference API (pretrained model: linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification).
    If HF API call fails or token is unconfigured, gracefully falls back to local PIL/NumPy vision heuristics.
    Returns {disease_name, confidence, recommended_action}.
    """
    try:
        image_bytes = await file.read()
        if not image_bytes:
            raise HTTPException(status_code=400, detail="Uploaded image file is empty.")
        
        result = DiseaseDetectorService.predict(image_bytes)
        return DiseasePredictResponse(**result)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Disease prediction error: {str(e)}")


# ----------------------------------------------------
# 2. NPK / IRRIGATION ADVISORY ENGINE
# ----------------------------------------------------
@app.post("/predict/advisory", response_model=AdvisoryPredictResponse, tags=["Inference"])
def predict_advisory(req: AdvisoryPredictRequest):
    """
    Accepts soil metrics & microclimate parameters.
    Evaluates transparent rule-based expert system thresholds for wheat, rice, cotton, soybean, or maize.
    Returns {irrigation_needed, irrigation_amount_mm, npk_recommendation, reasoning}.
    """
    try:
        return AgriAdvisorService.evaluate(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Advisory computation error: {str(e)}")


# ----------------------------------------------------
# 3. YIELD HARVEST WINDOW FORECASTING
# ----------------------------------------------------
@app.post("/predict/yield-forecast", response_model=YieldForecastResponse, tags=["Inference"])
def predict_yield_forecast(req: YieldForecastRequest):
    """
    Accepts crop_type, region, and telemetry summary.
    Calculates projected harvest window (start & end date range) and estimated yield quintals per acre.
    """
    try:
        return YieldAndMarketForecaster.forecast_yield(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Yield forecast error: {str(e)}")


# ----------------------------------------------------
# 4. MARKET PRICE FORECASTING
# ----------------------------------------------------
@app.post("/predict/price-forecast", response_model=PriceForecastResponse, tags=["Inference"])
def predict_price_forecast(req: PriceForecastRequest):
    """
    Accepts crop_name, mandi_name, and optional historical price series.
    Generates a 14-day Mandi spot price trajectory and returns optimal time-to-sell recommendation.
    """
    try:
        return YieldAndMarketForecaster.forecast_price(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Price forecast error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.AI_SERVICE_PORT, reload=True)
