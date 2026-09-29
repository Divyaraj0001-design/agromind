"""
main.py — FastAPI ML Microservice for Crop Recommendation.

Start:
  pip install -r requirements.txt
  python train.py          # train model first
  uvicorn main:app --reload --port 8000

Endpoint:
  POST /predict
  Body: { N, P, K, temperature, humidity, ph, rainfall }
  Returns: { recommendations: [{rank, crop, confidence, description}] }
"""

import os
import json
from pathlib import Path
from typing import Optional

import numpy as np
import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator

BASE = Path(__file__).parent
MODEL_PATH = BASE / "model.pkl"
ENCODER_PATH = BASE / "label_encoder.pkl"
STATS_PATH = BASE / "feature_stats.json"

# ── Load model at startup ─────────────────────────────────────────────────────
if not MODEL_PATH.exists() or not ENCODER_PATH.exists():
    raise RuntimeError(
        "Model not found. Run 'python train.py' first to train and save the model."
    )

clf = joblib.load(MODEL_PATH)
le = joblib.load(ENCODER_PATH)

feature_stats = {}
if STATS_PATH.exists():
    with open(STATS_PATH) as f:
        feature_stats = json.load(f)

CROPS = list(le.classes_)
print(f"✅ Model loaded. {len(CROPS)} crop classes: {CROPS}")

# ── Crop Descriptions (agronomic context for each predicted crop) ─────────────
CROP_DESCRIPTIONS = {
    "rice":        "Staple cereal requiring flooded paddies; tropical/subtropical regions; 3–6 months to harvest.",
    "maize":       "Versatile cereal for food, feed, and biofuel; warm climates; wide adaptability.",
    "chickpea":    "High-protein legume; nitrogen-fixing; ideal for semi-arid regions; improves soil health.",
    "kidneybeans": "Tropical legume; nutritious; requires well-drained soil; good rotation after cereals.",
    "pigeonpeas":  "Drought-tolerant legume; deep-rooted; excellent for dry land farming in BRICS regions.",
    "mothbeans":   "Drought-resistant legume; minimal water needs; suited for arid soils.",
    "mungbean":    "Short-duration legume (60–65 days); high protein; excellent summer crop.",
    "blackgram":   "Nutritious legume; tolerates waterlogging; popular in South and Southeast Asia.",
    "lentil":      "Cool-season legume; high protein; short duration; excellent soil restorative.",
    "pomegranate": "Drought-tolerant fruit crop; requires dry climate with irrigation; high market value.",
    "banana":      "Tropical/subtropical fruit; high water need; perennial; high yield per hectare.",
    "mango":       "Tropical fruit tree; drought-tolerant once established; long productive lifespan.",
    "grapes":      "Perennial vine; requires specific temperature range; high value crop for fresh market or wine.",
    "watermelon":  "Summer fruit crop; needs warm soil; fast-growing (80–85 days); high water requirement.",
    "muskmelon":   "Warm-season melon; 80–100 days to harvest; moderate water need.",
    "apple":       "Temperate fruit; requires cold winters for dormancy; high-value but climate-sensitive.",
    "orange":      "Subtropical citrus; requires mild winters; high Vitamin C; major export crop.",
    "papaya":      "Fast-growing tropical fruit; year-round production; sensitive to frost.",
    "coconut":     "Tropical palm; perennial; coastal/humid regions; full utility from fruit to fiber.",
    "cotton":      "Cash crop; warm climate; moderate water; major export in India, China, Brazil.",
    "jute":        "Fiber crop; tropical climate; high humidity and rainfall; eco-friendly alternative to synthetics.",
    "coffee":      "Tropical highland crop; requires consistent rainfall and mild temperatures; high-value export.",
    "wheat":       "Cool-season cereal; major staple globally; versatile in end-use; moderate water need.",
}

# ── Request/Response Models ────────────────────────────────────────────────────
class PredictRequest(BaseModel):
    N: float = Field(..., ge=0, le=200, description="Nitrogen content in soil (kg/ha)")
    P: float = Field(..., ge=0, le=200, description="Phosphorus content in soil (kg/ha)")
    K: float = Field(..., ge=0, le=200, description="Potassium content in soil (kg/ha)")
    temperature: float = Field(..., ge=-10, le=55, description="Temperature in °C")
    humidity: float = Field(..., ge=0, le=100, description="Relative humidity in %")
    ph: float = Field(..., ge=0, le=14, description="Soil pH")
    rainfall: float = Field(..., ge=0, le=3000, description="Annual rainfall in mm")

    @validator('ph')
    def ph_range(cls, v):
        if not (0 <= v <= 14):
            raise ValueError('pH must be between 0 and 14')
        return v


class CropRecommendation(BaseModel):
    rank: int
    crop: str
    confidence: float  # percentage 0-100
    description: Optional[str]


class PredictResponse(BaseModel):
    recommendations: list[CropRecommendation]
    inputSummary: dict
    modelInfo: dict


# ── FastAPI App ────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AgroMind ML Service",
    description="RandomForest crop recommendation model trained on Kaggle Crop Recommendation Dataset",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5050", "http://localhost:5173"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


@app.get("/")
def health():
    return {
        "status": "ok",
        "model": "RandomForestClassifier",
        "crops": len(CROPS),
        "cropList": CROPS,
    }


@app.post("/predict", response_model=PredictResponse)
def predict(body: PredictRequest):
    features = np.array([[body.N, body.P, body.K, body.temperature, body.humidity, body.ph, body.rainfall]])

    try:
        # Get class probabilities from RandomForest
        proba = clf.predict_proba(features)[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model prediction failed: {str(e)}")

    # Sort by probability descending, take top 3
    top_indices = np.argsort(proba)[::-1][:3]

    recommendations = []
    for rank, idx in enumerate(top_indices, start=1):
        crop_name = le.inverse_transform([idx])[0]
        confidence = round(float(proba[idx]) * 100, 2)
        recommendations.append(
            CropRecommendation(
                rank=rank,
                crop=crop_name.capitalize(),
                confidence=confidence,
                description=CROP_DESCRIPTIONS.get(crop_name.lower()),
            )
        )

    return PredictResponse(
        recommendations=recommendations,
        inputSummary={
            "N": body.N, "P": body.P, "K": body.K,
            "temperature": body.temperature, "humidity": body.humidity,
            "ph": body.ph, "rainfall": body.rainfall,
        },
        modelInfo={
            "algorithm": "RandomForestClassifier",
            "nEstimators": clf.n_estimators,
            "nClasses": len(CROPS),
            "dataset": "Kaggle Crop Recommendation Dataset (2200 rows)",
        },
    )
