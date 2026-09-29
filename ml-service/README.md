---
title: AgroMind ML Service
emoji: 🌾
colorFrom: green
colorTo: yellow
sdk: docker
app_port: 7860
---

# AgroMind ML Service

FastAPI microservice serving a RandomForest crop recommendation model
(trained on the Kaggle Crop Recommendation Dataset, 2200 rows, 22 crops).

## Endpoint

`POST /predict`

Body:
```json
{ "N": 90, "P": 42, "K": 43, "temperature": 32, "humidity": 70, "ph": 6, "rainfall": 164 }
```

Returns the top 3 crop recommendations with confidence scores from `predict_proba`.
