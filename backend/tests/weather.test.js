/**
 * Integration Tests — Weather Advisory Route
 * Hits the real Open-Meteo API (no key needed).
 * Run: npx jest tests/weather.test.js --testTimeout=15000
 */

const http = require('http')
const request = require('supertest')
const app = require('../server')

let server
beforeAll(done => { server = http.createServer(app); server.listen(0, done) })
afterAll(done => { server.close(done) })

describe('GET /api/weather/advisory', () => {
    it('returns valid weather data for Pune, India coordinates', async () => {
        const res = await request(server)
            .get('/api/weather/advisory')
            .query({ lat: 18.52, lon: 73.85 })
            .timeout(12000)

        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('current')
        expect(res.body).toHaveProperty('risk')
        expect(res.body).toHaveProperty('advisory')
        expect(res.body).toHaveProperty('forecast')
        expect(res.body.source).toMatch(/Open-Meteo/)
    }, 15000)

    it('current block contains expected fields with valid types', async () => {
        const res = await request(server)
            .get('/api/weather/advisory')
            .query({ lat: 28.61, lon: 77.20 }) // New Delhi
            .timeout(12000)

        expect(res.status).toBe(200)
        const { current } = res.body
        expect(typeof current.temperature).toBe('number')
        expect(typeof current.humidity).toBe('number')
        expect(typeof current.windSpeed).toBe('number')
        expect(typeof current.weatherCode).toBe('number')
        expect(typeof current.weatherLabel).toBe('string')
    }, 15000)

    it('risk field is one of Low, Medium, High', async () => {
        const res = await request(server)
            .get('/api/weather/advisory')
            .query({ lat: 19.07, lon: 72.87 }) // Mumbai
            .timeout(12000)

        expect(res.status).toBe(200)
        expect(['Low', 'Medium', 'High']).toContain(res.body.risk)
    }, 15000)

    it('forecast contains up to 5 days', async () => {
        const res = await request(server)
            .get('/api/weather/advisory')
            .timeout(12000)

        expect(res.status).toBe(200)
        expect(Array.isArray(res.body.forecast)).toBe(true)
        expect(res.body.forecast.length).toBeGreaterThanOrEqual(1)
        expect(res.body.forecast.length).toBeLessThanOrEqual(5)
    }, 15000)

    it('advisory is a non-empty string', async () => {
        const res = await request(server)
            .get('/api/weather/advisory')
            .timeout(12000)

        expect(res.status).toBe(200)
        expect(typeof res.body.advisory).toBe('string')
        expect(res.body.advisory.length).toBeGreaterThan(10)
    }, 15000)

    it('returns default location data when no lat/lon provided', async () => {
        const res = await request(server)
            .get('/api/weather/advisory')
            .timeout(12000)

        expect(res.status).toBe(200)
        expect(res.body.lat).toBe(18.52)
        expect(res.body.lon).toBe(73.85)
    }, 15000)
})
