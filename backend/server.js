require('dotenv').config()
const http = require('http')
const express = require('express')
const cors = require('cors')
const sqlite3 = require('sqlite3').verbose()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const path = require('path')
const fs = require('fs')

const app = express()
app.use(cors())
app.use(express.json({ limit: '20mb' }))
app.use(express.urlencoded({ extended: true, limit: '20mb' }))

const JWT_SECRET = process.env.JWT_SECRET || 'agromind-super-secret-key-123!!'

// Initialize SQLite database
const dbPath = path.resolve(__dirname, 'database.sqlite')
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Database connection error:', err.message)
    else console.log('✅ Connected to SQLite database.')
})

// Expose db on app.locals so routes can access it via req.app.locals.db
app.locals.db = db

// ── Run schema migrations ────────────────────────────────────────────────────
const schemaPath = path.resolve(__dirname, 'db', 'schema.sql')
if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8')
    // db.exec() can handle multi-statement SQL including multi-row INSERTs
    db.exec(schemaSql, (err) => {
        if (err && !err.message.includes('already exists') && !err.message.includes('UNIQUE constraint')) {
            console.warn('Schema migration warning:', err.message.slice(0, 120))
        }
    })
    console.log('✅ DB schema migrations applied.')
} else {
    console.warn('⚠️  db/schema.sql not found — skipping migrations.')
}

// ── Original users table (kept from existing server) ─────────────────────────
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`)

// ── Original Auth Routes ──────────────────────────────────────────────────────

// Register New User
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Please provide all required fields' })
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        const sql = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`
        db.run(sql, [name, email, hashedPassword], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'Email already exists' })
                }
                return res.status(500).json({ error: 'Failed to create user' })
            }
            const token = jwt.sign({ id: this.lastID, name, email }, JWT_SECRET, { expiresIn: '7d' })
            res.status(201).json({ message: 'User created successfully', token, user: { name, email } })
        })
    } catch (err) {
        res.status(500).json({ error: 'Server error during registration' })
    }
})

// Login User
app.post('/api/login', (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ error: 'Please enter both email and password' })
    }

    const sql = `SELECT * FROM users WHERE email = ?`
    db.get(sql, [email], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' })
        if (!user) return res.status(400).json({ error: 'Invalid email or password' })

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' })

        const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
        res.json({ message: 'Login successful', token, user: { name: user.name, email: user.email } })
    })
})

// ── New Feature Routes ────────────────────────────────────────────────────────
const weatherRoutes = require('./routes/weather')
const ndviRoutes    = require('./routes/ndvi')
const diseaseRoutes = require('./routes/disease')
const regenRoutes   = require('./routes/regen')
const bricsRoutes   = require('./routes/brics')

app.use('/api/weather', weatherRoutes)
app.use('/api/ndvi',    ndviRoutes)
app.use('/api/disease', diseaseRoutes)
app.use('/api/regen',   regenRoutes)
app.use('/api/brics',   bricsRoutes)

// ── ML Service Proxy ─────────────────────────────────────────────────────────
// Proxies crop prediction requests to the FastAPI ML microservice
// Uses Node 18+ global fetch for ML proxy

app.post('/api/crop-advisor/predict', async (req, res) => {
    const { N, P, K, temperature, humidity, ph, rainfall } = req.body

    // Validate all required ML inputs
    const requiredFields = { N, P, K, temperature, humidity, ph, rainfall }
    const missing = Object.entries(requiredFields)
        .filter(([, v]) => v === undefined || v === null || v === '')
        .map(([k]) => k)

    if (missing.length > 0) {
        return res.status(400).json({
            error: `Missing required fields: ${missing.join(', ')}`,
            required: ['N (nitrogen %)', 'P (phosphorus %)', 'K (potassium %)', 'temperature (°C)', 'humidity (%)', 'ph', 'rainfall (mm)'],
        })
    }

    const mlUrl = (process.env.ML_SERVICE_URL || 'http://localhost:8000') + '/predict'

    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000)

        const mlRes = await fetch(mlUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                N: parseFloat(N), P: parseFloat(P), K: parseFloat(K),
                temperature: parseFloat(temperature),
                humidity: parseFloat(humidity),
                ph: parseFloat(ph),
                rainfall: parseFloat(rainfall),
            }),
            signal: controller.signal,
        })
        clearTimeout(timeoutId)

        if (!mlRes.ok) {
            const errText = await mlRes.text()
            return res.status(502).json({
                error: 'ML service returned an error',
                detail: errText.slice(0, 200),
                hint: 'Make sure the FastAPI ML service is running: cd ml-service && uvicorn main:app --reload',
            })
        }

        const prediction = await mlRes.json()
        return res.json(prediction)
    } catch (err) {
        if (err.cause?.code === 'ECONNREFUSED' || err.code === 'ECONNREFUSED') {
            return res.status(503).json({
                error: 'ML microservice is not running',
                hint: 'Start it with: cd ml-service && uvicorn main:app --reload --port 8000',
            })
        }
        if (err.name === 'AbortError') {
            return res.status(504).json({ error: 'ML service request timed out' })
        }
        console.error('ML proxy error:', err.message)
        return res.status(500).json({ error: 'Failed to get crop prediction', detail: err.message })
    }
})

// ── Farm Records CRUD (persisted to SQLite) ───────────────────────────────────
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'Authentication required' })
    try {
        req.user = jwt.verify(token, JWT_SECRET)
        next()
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' })
    }
}

app.get('/api/farm-records', authMiddleware, (req, res) => {
    db.all(
        'SELECT * FROM farm_records WHERE user_id = ? ORDER BY planted DESC',
        [req.user.id],
        (err, rows) => {
            if (err) return res.status(500).json({ error: 'Database error' })
            res.json({ records: rows })
        }
    )
})

app.post('/api/farm-records', authMiddleware, (req, res) => {
    const { crop, field, area, planted, harvest, status, fertilizer, cost } = req.body
    if (!crop || !field) return res.status(400).json({ error: 'crop and field are required' })
    const sql = `INSERT INTO farm_records (user_id, crop, field, area, planted, harvest, status, fertilizer, cost)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    db.run(sql, [req.user.id, crop, field, area || 0, planted, harvest, status || 'Growing', fertilizer, cost || 0], function (err) {
        if (err) return res.status(500).json({ error: 'Failed to save record' })
        res.status(201).json({ id: this.lastID, message: 'Farm record saved' })
    })
})

app.delete('/api/farm-records/:id', authMiddleware, (req, res) => {
    db.run(
        'DELETE FROM farm_records WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.id],
        function (err) {
            if (err) return res.status(500).json({ error: 'Failed to delete record' })
            if (this.changes === 0) return res.status(404).json({ error: 'Record not found' })
            res.json({ message: 'Record deleted' })
        }
    )
})

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        version: '2.0.0',
        features: ['weather', 'ndvi', 'disease', 'regen', 'brics', 'crop-advisor'],
        agromonitoringConfigured: !!process.env.AGROMONITORING_API_KEY,
        plantIdConfigured: !!process.env.PLANT_ID_API_KEY,
        mlServiceUrl: process.env.ML_SERVICE_URL || 'http://localhost:8000',
        timestamp: new Date().toISOString(),
    })
})

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message)
    res.status(500).json({ error: 'Internal server error', detail: err.message })
})

const PORT = process.env.PORT || 5050

// Create an http.Server wrapping the express app.
// supertest 7 + Express 5 requires an http.Server (not a raw Express app)
// so that request(server).post(...) can call server.address() correctly.
const server = http.createServer(app)

// Only start listening when run directly — not when required by tests (supertest)
if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`🌾 AgroMind backend running on http://localhost:${PORT}`)
        console.log(`   Agromonitoring: ${process.env.AGROMONITORING_API_KEY ? '✅ Key configured' : '⚠️  Key not set (add to .env)'}`)
        console.log(`   Plant.id:       ${process.env.PLANT_ID_API_KEY ? '✅ Key configured' : '⚠️  Key not set (add to .env)'}`)
        console.log(`   Open-Meteo:     ✅ No key needed`)
        console.log(`   SoilGrids:      ✅ No key needed`)
        console.log(`   ML Service:     ${process.env.ML_SERVICE_URL || 'http://localhost:8000'}`)
    })
}

// Export both the express app (for tests that need a fresh server each file)
// and the bound server (for direct use). Tests should use app to create their
// own http.Server via http.createServer(app) so parallel Jest workers don't
// conflict on listen.
module.exports = app
module.exports.server = server
