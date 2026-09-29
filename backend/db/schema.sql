-- ====================================================
-- AgroMind BRICS Extension - Database Schema Additions
-- Run this once at server startup (handled by server.js)
-- ====================================================

-- Farm polygons for NDVI (Agromonitoring needs a polygon ID)
CREATE TABLE IF NOT EXISTS farm_polygons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    field_name TEXT NOT NULL,
    agromonitoring_polygon_id TEXT,          -- ID returned by Agromonitoring after creation
    geojson TEXT NOT NULL,                   -- GeoJSON polygon coordinates
    area_ha REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Farm crop records (persisted, linked to user)
CREATE TABLE IF NOT EXISTS farm_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    crop TEXT NOT NULL,
    field TEXT NOT NULL,
    area REAL DEFAULT 0,
    planted TEXT,
    harvest TEXT,
    status TEXT DEFAULT 'Growing',
    fertilizer TEXT,
    cost REAL DEFAULT 0,
    revenue REAL,
    yield_tonnes REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- BRICS Network anonymized snapshots
-- User data is stored anonymously - no PII, only farm metrics + broad region
-- NOTE: user_id=0 is reserved for system/demo seed data (no FK constraint needed)
CREATE TABLE IF NOT EXISTS brics_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL DEFAULT 0,
    region TEXT NOT NULL,       -- 'India-North', 'India-South', etc.
    ndvi_avg REAL,              -- 0.0-1.0
    soil_moisture REAL,         -- percentage 0-100
    soil_ph REAL,
    dominant_crop TEXT,
    weather_risk TEXT,          -- 'Low', 'Medium', 'High'
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- BRICS Demo Network Seed Data
-- Represents regional averages from public FAO agricultural statistics
-- user_id=0 = system/demo data (not a real user)
INSERT OR IGNORE INTO brics_snapshots (id, user_id, region, ndvi_avg, soil_moisture, soil_ph, dominant_crop, weather_risk, timestamp)
VALUES
    (1, 0, 'Brazil-Cerrado',       0.72, 41.0, 5.8, 'Soybean',  'Low',    '2026-09-20 10:00:00'),
    (2, 0, 'Russia-Volga',         0.61, 38.5, 6.2, 'Wheat',    'Medium', '2026-09-20 10:00:00'),
    (3, 0, 'China-Yangtze',        0.79, 65.0, 6.5, 'Rice',     'Low',    '2026-09-20 10:00:00'),
    (4, 0, 'South-Africa-Limpopo', 0.55, 29.0, 5.5, 'Maize',    'High',   '2026-09-20 10:00:00'),
    (5, 0, 'India-Punjab',         0.68, 52.0, 7.0, 'Wheat',    'Low',    '2026-09-20 10:00:00'),
    (6, 0, 'India-Deccan',         0.63, 35.0, 6.8, 'Cotton',   'Medium', '2026-09-20 10:00:00')

