/**
 * Integration Tests — BRICS Network Routes
 * All these tests use the in-memory/local SQLite DB — no external API.
 * Run: npx jest tests/brics.test.js
 */

const http = require('http')
const request = require('supertest')
const appModule = require('../server')

let server
beforeAll(done => { server = http.createServer(appModule); server.listen(0, done) })
afterAll(done => { server.close(done) })

let authToken = ''
const testEmail = `brics_test_${Date.now()}@agro.test`

beforeAll(async () => {
    // Register + login a test user
    const reg = await request(server)
        .post('/api/register')
        .send({ name: 'BRICS Tester', email: testEmail, password: 'test1234' })
        .timeout(5000)

    authToken = reg.body.token
    if (!authToken) {
        const login = await request(server)
            .post('/api/login')
            .send({ email: testEmail, password: 'test1234' })
            .timeout(5000)
        authToken = login.body.token
    }
})

describe('GET /api/brics/network', () => {
    it('returns 200 with regions array', async () => {
        const res = await request(server)
            .get('/api/brics/network')
            .timeout(5000)

        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('regions')
        expect(Array.isArray(res.body.regions)).toBe(true)
    }, 8000)

    it('network contains seeded demo regions', async () => {
        const res = await request(server)
            .get('/api/brics/network')
            .timeout(5000)

        expect(res.status).toBe(200)
        const regionNames = res.body.regions.map(r => r.region)
        // At least one BRICS region should be present from seed data
        const bricsRegions = ['Brazil-Cerrado', 'Russia-Volga', 'China-Yangtze', 'South-Africa-Limpopo', 'India-Punjab']
        const hasAny = bricsRegions.some(r => regionNames.includes(r))
        expect(hasAny).toBe(true)
    }, 8000)

    it('each region has expected shape', async () => {
        const res = await request(server)
            .get('/api/brics/network')
            .timeout(5000)

        expect(res.status).toBe(200)
        for (const region of res.body.regions) {
            expect(region).toHaveProperty('region')
            expect(region).toHaveProperty('dataPoints')
            expect(typeof region.dataPoints).toBe('number')
            expect(region.dataPoints).toBeGreaterThan(0)
        }
    }, 8000)

    it('network summary contains globalNdviAvg', async () => {
        const res = await request(server)
            .get('/api/brics/network')
            .timeout(5000)

        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('network')
        expect(res.body.network).toHaveProperty('totalRegions')
        expect(res.body.network).toHaveProperty('globalNdviAvg')
    }, 8000)
})

describe('POST /api/brics/snapshot', () => {
    it('returns 401 without auth token', async () => {
        const res = await request(server)
            .post('/api/brics/snapshot')
            .send({ region: 'India-North', ndviAvg: 0.65 })
            .timeout(5000)

        expect(res.status).toBe(401)
    }, 8000)

    it('returns 400 when region is missing', async () => {
        const res = await request(server)
            .post('/api/brics/snapshot')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ ndviAvg: 0.65 })
            .timeout(5000)

        expect(res.status).toBe(400)
        expect(res.body.error).toMatch(/region/i)
    }, 8000)

    it('saves snapshot successfully with full data', async () => {
        const res = await request(server)
            .post('/api/brics/snapshot')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                region: 'India-North',
                ndviAvg: 0.72,
                soilMoisture: 52.0,
                soilPh: 6.8,
                dominantCrop: 'Wheat',
                weatherRisk: 'Low',
            })
            .timeout(5000)

        expect(res.status).toBe(201)
        expect(res.body).toHaveProperty('id')
        expect(res.body.region).toBe('India-North')
    }, 8000)
})

describe('GET /api/brics/compare', () => {
    it('returns 401 without auth', async () => {
        const res = await request(server)
            .get('/api/brics/compare')
            .timeout(5000)

        expect(res.status).toBe(401)
    }, 8000)

    it('returns comparison data after saving a snapshot', async () => {
        // Save a snapshot first
        await request(server)
            .post('/api/brics/snapshot')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ region: 'India-North', ndviAvg: 0.68, soilMoisture: 45.0 })
            .timeout(5000)

        const res = await request(server)
            .get('/api/brics/compare')
            .set('Authorization', `Bearer ${authToken}`)
            .timeout(5000)

        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('userFarm')
        expect(res.body).toHaveProperty('networkAvg')
        expect(res.body).toHaveProperty('comparison')
        expect(res.body.userFarm.region).toBe('India-North')
    }, 8000)
})
