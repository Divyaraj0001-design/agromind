/**
 * routes/disease.js
 * Plant.id v3 Health Assessment API proxy.
 * https://web.plant.id/plant-identification-api/
 *
 * Requires: PLANT_ID_API_KEY in .env
 * POST /api/disease/analyze — accepts multipart image upload
 */

const express = require('express')
const router = express.Router()
const multer = require('multer')
// Uses Node 18+ global fetch
const FormData = require('form-data')

// Store upload in memory (no disk write — send directly to Plant.id)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are accepted'), false)
        }
        cb(null, true)
    },
})

const PLANT_ID_URL = 'https://api.plant.id/v3/health_assessment'

/**
 * POST /api/disease/analyze
 * Multipart form data: field name "image", type: image/*
 */
router.post('/analyze', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image file provided. Upload a leaf photo as multipart field "image".' })
    }

    const apiKey = process.env.PLANT_ID_API_KEY || ''
    if (!apiKey) {
        return res.status(503).json({
            error: 'Plant.id API key not configured',
            instructions: 'Add PLANT_ID_API_KEY to backend/.env — get a free key at web.plant.id (100 requests/month on free tier)',
        })
    }

    // Convert buffer to base64 for Plant.id API
    const base64Image = req.file.buffer.toString('base64')
    const mimeType = req.file.mimetype

    const requestBody = {
        images: [`data:${mimeType};base64,${base64Image}`],
        // Health assessment modifiers
        similar_images: true,
        health: 'all',        // Return all disease suggestions
        classification_level: 'all',
    }

    // Extra disease detail fields are requested via a query param, not the body
    const details = ['description', 'treatment', 'classification', 'common_names', 'cause', 'local_name'].join(',')
    const url = `${PLANT_ID_URL}?details=${details}`

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Api-Key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            timeout: 30000, // Plant.id can take up to 20s for complex images
        })

        if (!response.ok) {
            const rawText = await response.text()
            const errBody = (() => { try { return JSON.parse(rawText) } catch { return null } })()
            const detail = errBody?.error || errBody?.message || rawText || 'Unknown error'

            if (response.status === 401) {
                return res.status(401).json({
                    error: 'Plant.id API key is invalid or expired',
                    instructions: 'Check your PLANT_ID_API_KEY in backend/.env',
                })
            }
            if (response.status === 429) {
                return res.status(429).json({
                    error: 'Plant.id API rate limit exceeded',
                    detail: 'Free tier allows 100 requests/month. Upgrade at web.plant.id for more.',
                })
            }
            // Forward client errors (bad/invalid image, etc.) as-is; treat only 5xx upstream as a gateway error
            if (response.status >= 400 && response.status < 500) {
                return res.status(response.status).json({ error: 'Plant.id rejected the image', detail })
            }
            return res.status(502).json({
                error: 'Plant.id API error',
                status: response.status,
                detail,
            })
        }

        const data = await response.json()

        // Check if the plant is healthy overall
        const isHealthy = data.result?.is_healthy?.binary === true
        const healthProb = data.result?.is_healthy?.probability ?? null

        // Extract disease suggestions, sorted by probability
        const rawSuggestions = data.result?.disease?.suggestions || []
        const diseases = rawSuggestions
            .sort((a, b) => b.probability - a.probability)
            .slice(0, 5) // top 5
            .map(s => ({
                name: s.name || 'Unknown condition',
                commonNames: s.details?.common_names || [],
                probability: Math.round((s.probability || 0) * 100),
                description: s.details?.description || null,
                treatment: s.details?.treatment || null,
                cause: s.details?.cause || null,
                classification: s.details?.classification || [],
                similarImageUrls: (s.similar_images || []).slice(0, 2).map(img => img.url),
            }))

        // Plant identification (what plant is this?)
        const plantName = data.result?.classification?.suggestions?.[0]?.name || null
        const plantProb = data.result?.classification?.suggestions?.[0]?.probability || null

        return res.json({
            isHealthy,
            healthProbability: healthProb != null ? Math.round(healthProb * 100) : null,
            plant: plantName ? {
                name: plantName,
                confidence: Math.round((plantProb || 0) * 100),
            } : null,
            diseases,
            imageFilename: req.file.originalname,
            source: 'Plant.id v3 (web.plant.id)',
            timestamp: new Date().toISOString(),
        })
    } catch (err) {
        if (err.type === 'request-timeout' || err.name === 'AbortError') {
            return res.status(504).json({ error: 'Plant.id request timed out. Image may be too large or the service is slow.' })
        }
        console.error('Plant.id error:', err.message)
        return res.status(500).json({ error: 'Disease analysis failed', detail: err.message })
    }
})

// Handle multer file size / type errors
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ error: 'Image too large. Maximum size is 10MB.' })
        }
    }
    if (err.message === 'Only image files are accepted') {
        return res.status(415).json({ error: err.message })
    }
    next(err)
})

module.exports = router
