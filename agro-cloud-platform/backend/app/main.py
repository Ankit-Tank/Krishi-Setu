import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.db.session import Base, engine
from app.api.farmers import router as farmers_router, singular_router as farmer_singular_router
from app.api.farms import router as farms_router
from app.api.telemetry import router as telemetry_router
from app.api.leaf_scans import router as leaf_scans_router
from app.api.advisory import router as advisory_router
from app.api.market import router as market_router
from app.api.weather import router as weather_router

# Create database tables automatically if missing
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Agro-Cloud Platform Backend API",
    description=(
        "Cloud-Native Agri-Advisory & Market Linkage Ecosystem Backend Service. "
        "Provides REST endpoints for IoT telemetry ingestion, agronomic NPK/irrigation advisory, "
        "AI leaf disease diagnosis, APMC mandi price indexing, and buyer trade matching."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Open CORS policy for hackathon dev environment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static uploads directory for leaf scan images
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.get("/", tags=["Health"])
def root():
    return {
        "service": "Agro-Cloud Platform Backend API",
        "status": "healthy",
        "docs": "/docs"
    }


@app.get("/health", tags=["Health"])
def health():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "Agro-Cloud Backend",
        "version": "1.0.0"
    }


# Register Resource Routers
app.include_router(farmers_router)
app.include_router(farmer_singular_router)
app.include_router(farms_router)
app.include_router(telemetry_router)
app.include_router(leaf_scans_router)
app.include_router(advisory_router)
app.include_router(market_router)
app.include_router(weather_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
