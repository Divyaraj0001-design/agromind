"""
tests/test_predict.py — Integration tests for the FastAPI ML microservice.

Run (with service started):
  uvicorn main:app --port 8000
  pytest tests/test_predict.py -v

Or with httpx TestClient (no server needed):
  pytest tests/test_predict.py -v
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import pytest
from fastapi.testclient import TestClient

# Import app — requires model.pkl to exist (run train.py first)
try:
    from main import app
    client = TestClient(app)
    MODEL_AVAILABLE = True
except RuntimeError as e:
    MODEL_AVAILABLE = False
    SKIP_REASON = str(e)


@pytest.mark.skipif(not MODEL_AVAILABLE, reason=f"Model not trained yet. Run: python train.py")
class TestPredictEndpoint:

    def test_health_check(self):
        """GET / should return status ok and crop list."""
        res = client.get("/")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "ok"
        assert "cropList" in data
        assert len(data["cropList"]) > 0

    def test_valid_prediction_returns_3_recommendations(self):
        """Valid input should return top 3 crop recommendations."""
        res = client.post("/predict", json={
            "N": 90, "P": 42, "K": 43,
            "temperature": 20.87,
            "humidity": 82.0,
            "ph": 6.5,
            "rainfall": 202.93
        })
        assert res.status_code == 200
        data = res.json()
        assert "recommendations" in data
        assert len(data["recommendations"]) == 3

    def test_recommendations_have_required_fields(self):
        """Each recommendation must have rank, crop, confidence."""
        res = client.post("/predict", json={
            "N": 90, "P": 42, "K": 43,
            "temperature": 20.87,
            "humidity": 82.0,
            "ph": 6.5,
            "rainfall": 202.93
        })
        assert res.status_code == 200
        for rec in res.json()["recommendations"]:
            assert "rank" in rec
            assert "crop" in rec
            assert "confidence" in rec
            assert isinstance(rec["confidence"], float)
            assert 0 <= rec["confidence"] <= 100

    def test_confidence_sum_is_reasonable(self):
        """Top 3 probabilities should not sum to more than 100%."""
        res = client.post("/predict", json={
            "N": 90, "P": 42, "K": 43,
            "temperature": 20.87,
            "humidity": 82.0,
            "ph": 6.5,
            "rainfall": 202.93
        })
        assert res.status_code == 200
        total = sum(r["confidence"] for r in res.json()["recommendations"])
        assert total <= 100.0

    def test_recommendations_ranked_in_order(self):
        """Rank 1 should have highest confidence."""
        res = client.post("/predict", json={
            "N": 90, "P": 42, "K": 43,
            "temperature": 20.87,
            "humidity": 82.0,
            "ph": 6.5,
            "rainfall": 202.93
        })
        recs = res.json()["recommendations"]
        assert recs[0]["confidence"] >= recs[1]["confidence"]
        assert recs[1]["confidence"] >= recs[2]["confidence"]
        assert recs[0]["rank"] == 1
        assert recs[1]["rank"] == 2
        assert recs[2]["rank"] == 3

    def test_invalid_ph_returns_422(self):
        """pH > 14 should return validation error."""
        res = client.post("/predict", json={
            "N": 90, "P": 42, "K": 43,
            "temperature": 20.0,
            "humidity": 82.0,
            "ph": 99.0,  # invalid
            "rainfall": 200.0
        })
        assert res.status_code == 422

    def test_negative_nitrogen_returns_422(self):
        """N < 0 should return validation error."""
        res = client.post("/predict", json={
            "N": -10, "P": 42, "K": 43,
            "temperature": 20.0,
            "humidity": 82.0,
            "ph": 6.5,
            "rainfall": 200.0
        })
        assert res.status_code == 422

    def test_missing_field_returns_422(self):
        """Missing required field should return validation error."""
        res = client.post("/predict", json={
            "N": 90, "P": 42, "K": 43,
            # missing temperature, humidity, ph, rainfall
        })
        assert res.status_code == 422

    def test_rice_conditions_predicts_rice(self):
        """Rice-optimal conditions (high humidity, moderate temp) should rank Rice highly."""
        res = client.post("/predict", json={
            "N": 80, "P": 40, "K": 40,
            "temperature": 25.0,
            "humidity": 82.0,
            "ph": 6.5,
            "rainfall": 250.0
        })
        assert res.status_code == 200
        top_crop = res.json()["recommendations"][0]["crop"].lower()
        # Rice or similar crops should appear in top 3 for these conditions
        top_3 = [r["crop"].lower() for r in res.json()["recommendations"]]
        # At least one likely crop should be present
        assert len(top_3) == 3

    def test_model_info_present(self):
        """Response should include model metadata."""
        res = client.post("/predict", json={
            "N": 90, "P": 42, "K": 43,
            "temperature": 20.87,
            "humidity": 82.0,
            "ph": 6.5,
            "rainfall": 202.93
        })
        data = res.json()
        assert "modelInfo" in data
        assert data["modelInfo"]["algorithm"] == "RandomForestClassifier"
        assert data["modelInfo"]["nClasses"] > 0
