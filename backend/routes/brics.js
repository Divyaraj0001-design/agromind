/**
 * routes/brics.js
 * BRICS Network — Anonymized cross-region farm analytics.
 *
 * Routes:
 *   POST /api/brics/snapshot  — authenticated: save user's current farm metrics
 *   GET  /api/brics/network   — aggregated regional averages
 *   GET  /api/brics/compare   — current user's metrics vs network averages
 */

const express = require('express')
const router = express.Router()
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

/**
 * POST /api/brics/snapshot
 * Saves the authenticated user's current farm metrics as an anonymized snapshot.
 * Body: { region, ndviAvg, soilMoisture, soilPh, dominantCrop, weatherRisk }
 */
router.post('/snapshot', authMiddleware, (req, res) => {
    const db = req.app.locals.db
    const { region, ndviAvg, soilMoisture, soilPh, dominantCrop, weatherRisk } = req.body

    if (!region) {
        return res.status(400).json({ error: 'region is required (e.g. "India-North")' })
    }

    const sql = `INSERT INTO brics_snapshots (user_id, region, ndvi_avg, soil_moisture, soil_ph, dominant_crop, weather_risk)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`

    db.run(
        sql,
        [req.user.id, region, ndviAvg || null, soilMoisture || null, soilPh || null, dominantCrop || null, weatherRisk || null],
        function (err) {
            if (err) return res.status(500).json({ error: 'Failed to save snapshot', detail: err.message })
            return res.status(201).json({
                id: this.lastID,
                message: 'Farm snapshot saved to BRICS network (anonymized)',
                region,
            })
        }
    )
})

/**
 * GET /api/brics/network
 * Returns aggregated regional averages across all snapshots.
 * Each region is represented by its most recent snapshot (deduplicated by region).
 */
router.get('/network', (req, res) => {
    const db = req.app.locals.db

    // Aggregate latest snapshot per region (includes demo seed data with user_id=0)
    const sql = `
        SELECT
            region,
            AVG(ndvi_avg)      AS ndvi_avg,
            AVG(soil_moisture) AS soil_moisture,
            AVG(soil_ph)       AS soil_ph,
            MAX(timestamp)     AS latest_update,
            COUNT(*)           AS data_points,
            MAX(CASE WHEN dominant_crop IS NOT NULL THEN dominant_crop END) AS dominant_crop,
            MAX(CASE WHEN weather_risk IS NOT NULL THEN weather_risk END)   AS weather_risk
        FROM brics_snapshots
        GROUP BY region
        ORDER BY region ASC
    `

    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error', detail: err.message })

        const regions = rows.map(r => ({
            region: r.region,
            ndviAvg: r.ndvi_avg != null ? parseFloat(r.ndvi_avg.toFixed(3)) : null,
            soilMoisture: r.soil_moisture != null ? parseFloat(r.soil_moisture.toFixed(1)) : null,
            soilPh: r.soil_ph != null ? parseFloat(r.soil_ph.toFixed(1)) : null,
            dominantCrop: r.dominant_crop,
            weatherRisk: r.weather_risk,
            dataPoints: r.data_points,
            latestUpdate: r.latest_update,
            // Flag demo/seed data clearly
            isDemo: !rows.some(row => row.region === r.region && parseInt(row.user_id) > 0),
        }))

        // Global averages
        const validNdvi = regions.filter(r => r.ndviAvg != null).map(r => r.ndviAvg)
        const validMoisture = regions.filter(r => r.soilMoisture != null).map(r => r.soilMoisture)
        const globalNdvi = validNdvi.length ? (validNdvi.reduce((a, b) => a + b, 0) / validNdvi.length) : null
        const globalMoisture = validMoisture.length ? (validMoisture.reduce((a, b) => a + b, 0) / validMoisture.length) : null

        return res.json({
            regions,
            network: {
                totalRegions: regions.length,
                globalNdviAvg: globalNdvi != null ? parseFloat(globalNdvi.toFixed(3)) : null,
                globalSoilMoistureAvg: globalMoisture != null ? parseFloat(globalMoisture.toFixed(1)) : null,
            },
            note: 'Regions marked isDemo=true use representative agricultural baseline data. Real user farms update this data as users share their metrics.',
            timestamp: new Date().toISOString(),
        })
    })
})

/**
 * GET /api/brics/compare
 * Compares the authenticated user's latest snapshot against network averages.
 */
router.get('/compare', authMiddleware, (req, res) => {
    const db = req.app.locals.db

    // Get user's latest snapshot
    db.get(
        'SELECT * FROM brics_snapshots WHERE user_id = ? ORDER BY timestamp DESC LIMIT 1',
        [req.user.id],
        (err, userSnapshot) => {
            if (err) return res.status(500).json({ error: 'Database error', detail: err.message })

            // Get network averages
            db.all(
                `SELECT AVG(ndvi_avg) as ndvi, AVG(soil_moisture) as moisture, COUNT(DISTINCT user_id) as farms
                 FROM brics_snapshots`,
                [],
                (err2, [networkAvg]) => {
                    if (err2) return res.status(500).json({ error: 'Database error', detail: err2.message })

                    if (!userSnapshot) {
                        return res.json({
                            userSnapshot: null,
                            networkAvg,
                            message: 'No snapshot from your farm yet. Use POST /api/brics/snapshot to contribute.',
                        })
                    }

                    const ndviDelta = userSnapshot.ndvi_avg != null && networkAvg.ndvi != null
                        ? parseFloat((userSnapshot.ndvi_avg - networkAvg.ndvi).toFixed(3))
                        : null

                    const moistureDelta = userSnapshot.soil_moisture != null && networkAvg.moisture != null
                        ? parseFloat((userSnapshot.soil_moisture - networkAvg.moisture).toFixed(1))
                        : null

                    return res.json({
                        userFarm: {
                            region: userSnapshot.region,
                            ndviAvg: userSnapshot.ndvi_avg,
                            soilMoisture: userSnapshot.soil_moisture,
                            soilPh: userSnapshot.soil_ph,
                            dominantCrop: userSnapshot.dominant_crop,
                            weatherRisk: userSnapshot.weather_risk,
                            snapshotTime: userSnapshot.timestamp,
                        },
                        networkAvg: {
                            ndvi: networkAvg.ndvi != null ? parseFloat(networkAvg.ndvi.toFixed(3)) : null,
                            soilMoisture: networkAvg.moisture != null ? parseFloat(networkAvg.moisture.toFixed(1)) : null,
                            totalFarms: networkAvg.farms,
                        },
                        comparison: {
                            ndviVsNetwork: ndviDelta,
                            ndviStatus: ndviDelta == null ? null : ndviDelta > 0.05 ? 'Above Average' : ndviDelta < -0.05 ? 'Below Average' : 'Average',
                            moistureVsNetwork: moistureDelta,
                            moistureStatus: moistureDelta == null ? null : moistureDelta > 5 ? 'Above Average' : moistureDelta < -5 ? 'Below Average' : 'Average',
                        },
                        timestamp: new Date().toISOString(),
                    })
                }
            )
        }
    )
})

module.exports = router
