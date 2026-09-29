/**
 * Integration Tests — NDVI / SoilGrids Routes
 * SoilGrids tests hit the real ISRIC API (no key needed).
 * NDVI tests verify graceful error when key is not configured.
 * Run: npx jest tests/ndvi.test.js --testTimeout=20000
 */

const request = require('supertest')
const app = require('../server')

// ─── SoilGrids Tests (always live, no key needed) ─────────────────────────────
describe('GET /api/ndvi/soilgrid', () => {
    it('returns soil properties for a valid coordinate (Pune, India)', async () => {
        const res = await request(app)
            .get('/api/ndvi/soilgrid')
            .query({ lat: 18.52, lon: 73.85 })
            .timeout(18000)

        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('soilProperties')
        expect(res.body).toHaveProperty('soilHealthScore')
        expect(res.body).toHaveProperty('soilHealthStatus')
        expect(res.body.source).toMatch(/SoilGrids/)
    }, 20000)

    it('soilHealthScore is a number between 0 and 100', async () => {
        const res = await request(app)
            .get('/api/ndvi/soilgrid')
            .query({ lat: 28.61, lon: 77.20 }) // Delhi
            .timeout(18000)

        expect(res.status).toBe(200)
        expect(typeof res.body.soilHealthScore).toBe('number')
        expect(res.body.soilHealthScore).toBeGreaterThanOrEqual(0)
        expect(res.body.soilHealthScore).toBeLessThanOrEqual(100)
    }, 20000)

    it('soilHealthStatus is one of Good, Fair, Poor', async () => {
        const res = await request(app)
            .get('/api/ndvi/soilgrid')
            .query({ lat: 12.97, lon: 77.59 }) // Bangalore
            .timeout(18000)

        expect(res.status).toBe(200)
        expect(['Good', 'Fair', 'Poor']).toContain(res.body.soilHealthStatus)
    }, 20000)

    it('returns 400 when lat/lon are missing', async () => {
        const res = await request(app)
            .get('/api/ndvi/soilgrid')
            .timeout(5000)

        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('error')
    }, 8000)

    it('returns 400 when lat is not a number', async () => {
        const res = await request(app)
            .get('/api/ndvi/soilgrid')
            .query({ lat: 'badvalue', lon: 73.85 })
            .timeout(5000)

        expect(res.status).toBe(400)
    }, 8000)
})

// ─── NDVI/Polygon Tests (graceful stub when API key not set) ──────────────────
describe('NDVI routes (Agromonitoring)', () => {
    it('GET /api/ndvi/polygons returns 401 without auth token', async () => {
        const res = await request(app)
            .get('/api/ndvi/polygons')
            .timeout(5000)

        expect(res.status).toBe(401)
    }, 8000)

    it('GET /api/ndvi/stats returns 503 with clear message when API key not configured', async () => {
        // Login first to get a valid token
        // Use test user — register if not exists
        await request(app)
            .post('/api/register')
            .send({ name: 'Test Farmer', email: 'testfarm@agro.test', password: 'testpass123' })

        const loginRes = await request(app)
            .post('/api/login')
            .send({ email: 'testfarm@agro.test', password: 'testpass123' })

        const token = loginRes.body.token

        // First, we need a polygon — POST one
        const polyRes = await request(app)
            .post('/api/ndvi/polygon')
            .set('Authorization', `Bearer ${token}`)
            .send({
                fieldName: 'Test Field',
                geojson: {
                    type: 'Polygon',
                    coordinates: [[[73.85, 18.52], [73.86, 18.52], [73.86, 18.53], [73.85, 18.53], [73.85, 18.52]]]
                }
            })
            .timeout(10000)

        expect(polyRes.status).toBe(201)

        // Now fetch NDVI stats — should get 503 since key is not set
        const statsRes = await request(app)
            .get('/api/ndvi/stats')
            .set('Authorization', `Bearer ${token}`)
            .query({ polygonId: polyRes.body.id })
            .timeout(5000)

        // With no API key, should return 503 with clear message
        if (!process.env.AGROMONITORING_API_KEY) {
            expect(statsRes.status).toBe(503)
            expect(statsRes.body.error).toMatch(/API key not configured/i)
            expect(statsRes.body.instructions).toBeDefined()
        } else {
            // If key IS set (CI environment), it should return 200 or a real API error
            expect([200, 400, 404, 502]).toContain(statsRes.status)
        }
    }, 20000)

    it('POST /api/ndvi/polygon returns 400 without required fields', async () => {
        await request(app)
            .post('/api/register')
            .send({ name: 'Test2', email: 'test2@agro.test', password: 'testpass123' })
        const loginRes = await request(app)
            .post('/api/login')
            .send({ email: 'test2@agro.test', password: 'testpass123' })
        const token = loginRes.body.token

        const res = await request(app)
            .post('/api/ndvi/polygon')
            .set('Authorization', `Bearer ${token}`)
            .send({ fieldName: 'Missing GeoJSON' }) // no geojson
            .timeout(5000)

        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('error')
    }, 10000)
})
