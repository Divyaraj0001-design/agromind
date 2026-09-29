# 🌾 AgroMind — AI-Powered Smart Farming Platform

AgroMind is a full-stack smart farming platform built for BRICS-region farmers. It combines a React frontend, Node.js/Express backend, Python ML microservice, and several third-party APIs to deliver real-time crop advisory, plant disease detection, smart irrigation, weather intelligence, market insights, and regenerative agriculture tools.

---

## 🏗️ Architecture

```
smart-farming/
├── src/                    # React + Vite frontend (port 5173)
│   ├── pages/              # 12 full-featured pages
│   ├── components/         # Shared UI: Layout, Sidebar, TopNav, Modals
│   ├── hooks/useApi.js     # Generic fetch hook (GET/POST + JWT auth)
│   └── utils/formatters.js # INR, date, percent formatters
│
├── backend/                # Node.js + Express API (port 5050)
│   ├── server.js           # Main server: auth, farm records CRUD, ML proxy
│   ├── routes/
│   │   ├── weather.js      # Open-Meteo weather + SoilGrids soil advisory
│   │   ├── ndvi.js         # Agromonitoring NDVI + SoilGrids soil properties
│   │   ├── disease.js      # Plant.id v3 health assessment proxy
│   │   ├── regen.js        # Rule-based crop rotation engine (no key needed)
│   │   └── brics.js        # BRICS network anonymized farm analytics
│   └── db/schema.sql       # SQLite schema (farm_polygons, farm_records, brics_snapshots)
│
└── ml-service/             # FastAPI Python ML microservice (port 8000)
    ├── train.py            # Train RandomForest on Kaggle Crop Dataset
    ├── main.py             # FastAPI /predict endpoint
    └── requirements.txt
```

---

## 🚀 Quick Start

### 1. Frontend
```bash
npm install
npm run dev          # http://localhost:5173
```

### 2. Backend
```bash
cd backend
npm install
# Copy .env and add API keys (see below)
node server.js       # http://localhost:5050
```

### 3. ML Service
```bash
cd ml-service
pip install -r requirements.txt
python train.py             # Train model first — creates model.pkl
uvicorn main:app --reload --port 8000
```

---

## 🔑 API Keys (backend/.env)

| Key | Required | Free Tier | Source |
|-----|----------|-----------|--------|
| `PLANT_ID_API_KEY` | Disease Detection | 100 req/month | [web.plant.id](https://web.plant.id) |
| `AGROMONITORING_API_KEY` | NDVI / Satellite | 5 polygons free | [agromonitoring.com](https://agromonitoring.com) |
| `JWT_SECRET` | Auth | — | Set any secret string |
| Open-Meteo | Weather | ✅ No key | [open-meteo.com](https://open-meteo.com) |
| SoilGrids ISRIC | Soil data | ✅ No key | [soilgrids.org](https://soilgrids.org) |

---

## 🌟 Features

| Feature | Page | Backend | API |
|---------|------|---------|-----|
| 🌱 AI Crop Advisor | `/app/crop-advisor` | ML Proxy | FastAPI + RandomForest |
| 🔬 Disease Detection | `/app/disease-detection` | `routes/disease.js` | Plant.id v3 |
| 💧 Irrigation Planner | `/app/irrigation` | — | Static AI rules |
| 🌤️ Weather Intelligence | `/app/weather` | `routes/weather.js` | Open-Meteo |
| 📈 Market Insights | `/app/market` | — | Static data + charts |
| 🌿 Regen Agriculture | `/app/regen` | `routes/regen.js` | Rule-based rotation engine |
| 🌍 BRICS Network | `/app/brics` | `routes/brics.js` | SQLite aggregated analytics |
| 📋 Farm Records | `/app/records` | SQLite CRUD | JWT-protected |
| 🛰️ NDVI Monitor | Dashboard | `routes/ndvi.js` | Agromonitoring + SoilGrids |
| 🔐 Auth | `/login` | JWT + bcrypt | SQLite users |
| 🛡️ Admin Panel | `/app/admin` | — | User management UI |

---

## 🧠 ML Service — Crop Recommendation

- **Algorithm:** RandomForestClassifier (sklearn)
- **Dataset:** [Kaggle Crop Recommendation Dataset](https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset) — 2,200 rows, 22 crop classes
- **Inputs:** N, P, K (soil nutrients), temperature, humidity, pH, rainfall
- **Output:** Top 3 crop recommendations with confidence scores + agronomic descriptions
- **Accuracy:** ~98% on test set (random forest with 100 estimators)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 7 + React Router 7 |
| UI Library | Recharts, Lucide React, Framer Motion |
| Maps | React-Leaflet + Leaflet |
| Styling | Vanilla CSS with design tokens (dark, green-themed) |
| Backend | Node.js 18+ + Express 4 |
| Database | SQLite 3 (via better-sqlite3) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| ML | FastAPI + scikit-learn + NumPy + joblib |
| APIs | Open-Meteo, SoilGrids ISRIC, Agromonitoring, Plant.id v3 |

---

## 📜 License

MIT — Built for BRICS Agricultural Innovation Hackathon 2026.
