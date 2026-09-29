/**
 * routes/ndvi.js
 * Agromonitoring API — NDVI + Soil Moisture + SoilGrids soil properties.
 *
 * Agromonitoring docs: https://agromonitoring.com/api/
 * SoilGrids docs:      https://api.isric.org/soilgrids/v2.0/docs
 *
 * Requires: AGROMONITORING_API_KEY in .env
 * SoilGrids: completely free, no key required.
 *
 * Routes:
 *   POST /api/ndvi/polygon      — save/register farm polygon
 *   GET  /api/ndvi/stats        — fetch NDVI + soil moisture
 *   GET  /api/ndvi/soilgrid     — fetch soil properties from SoilGrids
 *   GET  /api/ndvi/polygons     — list user's saved polygons
 */

const express = require('express')
const router = express.Router()
// Uses Node 18+ global fetch

// Middleware: verify JWT token (reuse from main server)
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET || 'agromind-super-secret-key-123!!'

function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'Authentication required' })
    try {
        req.user = jwt.verify(token, JWT_SECRET)
        next()
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' })
    }
}

const AGRO_BASE = 'https://api.agromonitoring.com/agro/1.0'

function getAgroKey() {
    return process.env.AGROMONITORING_API_KEY || ''
}

/**
 * POST /api/ndvi/polygon
 * Body: { fieldName, geojson (GeoJSON polygon Feature), lat, lon }
 * Saves polygon to SQLite and registers with Agromonitoring if key is set.
 */
router.post('/polygon', authMiddleware, async (req, res) => {
    const db = req.app.locals.db
    const { fieldName, geojson, lat, lon } = req.body

    if (!fieldName || !geojson) {
        return res.status(400).json({ error: 'fieldName and geojson are required' })
    }

    let agromonitoringId = null

    const apiKey = getAgroKey()
    if (!apiKey) {
        // Save to DB without Agromonitoring registration
        // NDVI stats will return "API key not configured" when fetched
    } else {
        // Register polygon with Agromonitoring
        try {
            // duplicated=true: Agromonitoring otherwise rejects a polygon with coordinates
            // identical to one already registered (e.g. redrawing the same field boundary)
            const agroRes = await fetch(`${AGRO_BASE}/polygons?appid=${apiKey}&duplicated=true`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: fieldName,
                    geo_json: {
                        type: 'Feature',
                        properties: {},
                        geometry: geojson.type === 'Feature' ? geojson.geometry : geojson,
                    }
                }),
                timeout: 10000,
            })

            if (agroRes.ok) {
                const agroData = await agroRes.json()
                agromonitoringId = agroData.id
            } else {
                const errText = await agroRes.text()
                console.error('Agromonitoring polygon registration failed:', errText)
                // Continue saving locally even if Agromonitoring fails
            }
        } catch (err) {
            console.error('Agromonitoring polygon registration error:', err.message)
        }
    }

    // Save to SQLite
    const sql = `INSERT INTO farm_polygons (user_id, field_name, agromonitoring_polygon_id, geojson, area_ha)
                 VALUES (?, ?, ?, ?, ?)`
    const geojsonStr = typeof geojson === 'string' ? geojson : JSON.stringify(geojson)

    db.run(sql, [req.user.id, fieldName, agromonitoringId, geojsonStr, null], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to save polygon to database', detail: err.message })
        }
        return res.status(201).json({
            id: this.lastID,
            fieldName,
            agromonitoringId,
            registered: !!agromonitoringId,
            message: agromonitoringId
                ? 'Polygon saved and registered with Agromonitoring'
                : 'Polygon saved locally (Agromonitoring key not configured)',
        })
    })
})

/**
 * GET /api/ndvi/polygons
 * Returns list of user's saved polygons.
 */
router.get('/polygons', authMiddleware, (req, res) => {
    const db = req.app.locals.db
    db.all(
        'SELECT id, field_name, agromonitoring_polygon_id, geojson, area_ha, created_at FROM farm_polygons WHERE user_id = ? ORDER BY created_at DESC',
        [req.user.id],
        (err, rows) => {
            if (err) return res.status(500).json({ error: 'Database error', detail: err.message })
            return res.json({ polygons: rows })
        }
    )
})

/**
 * GET /api/ndvi/stats?polygonId=
 * Fetches NDVI + soil moisture from Agromonitoring for a saved polygon.
 * Returns an error (not fake data) if API key is missing.
 */
router.get('/stats', authMiddleware, async (req, res) => {
    const db = req.app.locals.db
    const { polygonId } = req.query

    if (!polygonId) {
        return res.status(400).json({ error: 'polygonId query param is required' })
    }

    // Get polygon from DB
    const polygon = await new Promise((resolve, reject) => {
        db.get(
            'SELECT * FROM farm_polygons WHERE id = ? AND user_id = ?',
            [polygonId, req.user.id],
            (err, row) => err ? reject(err) : resolve(row)
        )
    }).catch(err => {
        return res.status(500).json({ error: 'Database error', detail: err.message })
    })

    if (!polygon) {
        return res.status(404).json({ error: 'Polygon not found or access denied' })
    }

    const apiKey = getAgroKey()
    if (!apiKey) {
        return res.status(503).json({
            error: 'Agromonitoring API key not configured',
            instructions: 'Add AGROMONITORING_API_KEY to backend/.env — get a free key at agromonitoring.com',
        })
    }

    if (!polygon.agromonitoring_polygon_id) {
        return res.status(503).json({
            error: 'Polygon not yet registered with Agromonitoring',
            instructions: 'Delete and re-draw the polygon after adding AGROMONITORING_API_KEY to .env',
        })
    }

    const polyId = polygon.agromonitoring_polygon_id

    // Fetch NDVI (last 30 days, most recent valid value)
    const now = Math.floor(Date.now() / 1000)
    const thirtyDaysAgo = now - 30 * 86400

    try {
        const [ndviRes, soilRes] = await Promise.all([
            fetch(
                `${AGRO_BASE}/ndvi/history?polyid=${polyId}&appid=${apiKey}&start=${thirtyDaysAgo}&end=${now}`,
                { timeout: 10000 }
            ),
            fetch(
                `${AGRO_BASE}/soil?polyid=${polyId}&appid=${apiKey}`,
                { timeout: 10000 }
            ),
        ])

        const results = {}

        // Parse NDVI
        if (ndviRes.ok) {
            const ndviData = await ndviRes.json()
            // ndviData is an array sorted by date — each entry has data.mean (the NDVI value), range -1 to 1
            const validEntries = (ndviData || []).filter(e => e.data?.mean !== undefined && e.data.mean > -1)
            if (validEntries.length > 0) {
                const latest = validEntries[validEntries.length - 1]
                const ndvi = latest.data.mean // range: -1 to 1 (vegetation: 0.2 to 0.9)
                // Scale to 0–100% crop health indicator
                // NDVI of 0.2 → ~0%, 0.8 → ~100%
                const healthPct = Math.min(100, Math.max(0, Math.round(((ndvi - 0.2) / 0.6) * 100)))
                results.ndvi = {
                    raw: ndvi,
                    healthPercent: healthPct,
                    date: latest.dt ? new Date(latest.dt * 1000).toISOString() : null,
                    interpretation: ndvi > 0.6 ? 'Healthy' : ndvi > 0.4 ? 'Moderate' : 'Stressed',
                }
            } else {
                results.ndvi = { error: 'No valid NDVI readings available for this polygon in the last 30 days (may need cloud-free imagery)' }
            }
        } else {
            results.ndvi = { error: `Agromonitoring NDVI API error: ${ndviRes.status}` }
        }

        // Parse Soil Moisture
        if (soilRes.ok) {
            const soilData = await soilRes.json()
            // Response is a flat object: { dt, t10, moisture, t0 }. moisture is m³/m³ (0-1); convert to percentage
            const moisture = soilData.moisture
            results.soil = {
                moistureRaw: moisture,
                moisturePercent: moisture != null ? Math.round(moisture * 100) : null,
                temperature10cm: soilData.t10 != null ? (soilData.t10 - 273.15).toFixed(1) : null,
                date: soilData.dt ? new Date(soilData.dt * 1000).toISOString() : null,
                status: moisture > 0.5 ? 'High' : moisture > 0.3 ? 'Adequate' : moisture > 0.15 ? 'Low' : 'Critical',
            }
        } else {
            results.soil = { error: `Agromonitoring Soil API error: ${soilRes.status}` }
        }

        return res.json({
            polygonId,
            fieldName: polygon.field_name,
            ...results,
            source: 'Agromonitoring API (agromonitoring.com)',
            timestamp: new Date().toISOString(),
        })
    } catch (err) {
        console.error('NDVI stats fetch error:', err.message)
        return res.status(500).json({ error: 'Failed to fetch NDVI/soil data', detail: err.message })
    }
})

/**
 * GET /api/ndvi/soilgrid?lat=&lon=
 * Fetches soil properties from SoilGrids (ISRIC) — no API key needed.
 * Returns: pH, organic carbon, clay%, sand%, nitrogen content.
 */
router.get('/soilgrid', async (req, res) => {
    const lat = parseFloat(req.query.lat)
    const lon = parseFloat(req.query.lon)

    if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({ error: 'lat and lon query parameters are required and must be numbers' })
    }

    // SoilGrids v2 REST API — completely free, no auth
    const properties = ['phh2o', 'ocd', 'clay', 'sand', 'nitrogen', 'soc']
    const depths = ['0-5cm', '5-15cm', '15-30cm']

    const url = new URL('https://rest.isric.org/soilgrids/v2.0/properties/query')
    url.searchParams.set('lon', lon)
    url.searchParams.set('lat', lat)
    properties.forEach(p => url.searchParams.append('property', p))
    depths.forEach(d => url.searchParams.append('depth', d))
    url.searchParams.set('value', 'mean')

    try {
        const response = await fetch(url.toString(), {
            headers: { 'Accept': 'application/json', 'User-Agent': 'AgroMind/1.0' },
            timeout: 12000,
        })

        if (!response.ok) {
            const text = await response.text()
            return res.status(502).json({
                error: 'SoilGrids API returned an error',
                detail: text.slice(0, 300),
            })
        }

        const raw = await response.json()

        // Parse and normalize SoilGrids response
        const result = {}
        for (const layer of (raw.properties?.layers || [])) {
            const name = layer.name
            const topDepth = layer.depths?.[0]
            if (!topDepth) continue
            const mean = topDepth.values?.mean
            if (mean == null) continue

            // SoilGrids units: phh2o is pH*10, nitrogen is cg/kg, ocd is dg/dm3
            if (name === 'phh2o') result.pH = (mean / 10).toFixed(1)
            else if (name === 'nitrogen') result.nitrogenCgKg = mean
            else if (name === 'ocd') result.organicCarbonDensity = (mean / 10).toFixed(2)
            else if (name === 'clay') result.clayPercent = mean
            else if (name === 'sand') result.sandPercent = mean
            else if (name === 'soc') result.soilOrganicCarbon = (mean / 10).toFixed(2)
        }

        // Derive a soil health status
        const ph = parseFloat(result.pH)
        const soilHealthScore = (() => {
            let s = 0
            if (ph >= 6.0 && ph <= 7.5) s += 30
            else if (ph >= 5.5 && ph < 6.0) s += 15
            if ((result.soilOrganicCarbon || 0) > 1.5) s += 25
            if ((result.clayPercent || 0) > 10 && (result.clayPercent || 0) < 50) s += 20
            if ((result.nitrogenCgKg || 0) > 100) s += 25
            return Math.min(100, s)
        })()

        return res.json({
            lat, lon,
            soilProperties: result,
            soilHealthScore,
            soilHealthStatus: soilHealthScore > 70 ? 'Good' : soilHealthScore > 40 ? 'Fair' : 'Poor',
            source: 'SoilGrids v2 (ISRIC — rest.isric.org)',
            timestamp: new Date().toISOString(),
        })
    } catch (err) {
        if (err.type === 'request-timeout') {
            return res.status(504).json({ error: 'SoilGrids request timed out — the ISRIC server may be slow. Try again.' })
        }
        console.error('SoilGrids error:', err.message)
        return res.status(500).json({ error: 'Failed to fetch soil properties', detail: err.message })
    }
})

module.exports = router
