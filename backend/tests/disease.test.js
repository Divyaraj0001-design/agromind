/**
 * Integration Tests — Disease Detection Route
 * Tests graceful 503 when Plant.id API key is not configured.
 * Run: npx jest tests/disease.test.js
 */

const request = require('supertest')
const path = require('path')
const fs = require('fs')
const app = require('../server')

// Create a minimal 1x1 pixel PNG for testing (avoids needing a real photo)
function createMinimalPng() {
    // Minimal valid PNG: 1x1 transparent pixel
    const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
        0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // IHDR chunk length + type
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // width=1, height=1
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, // bit depth, color type, etc.
        0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, // IDAT chunk
        0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
        0x00, 0x00, 0x02, 0x00, 0x01, 0xe2, 0x21, 0xbc,
        0x33, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, // IEND
        0x44, 0xae, 0x42, 0x60, 0x82
    ])
    return pngBuffer
}

describe('POST /api/disease/analyze', () => {
    it('returns 400 when no image is uploaded', async () => {
        const res = await request(app)
            .post('/api/disease/analyze')
            .timeout(5000)

        expect(res.status).toBe(400)
        expect(res.body).toHaveProperty('error')
        expect(res.body.error).toMatch(/No image/i)
    }, 8000)

    it('returns 503 with instructions when Plant.id key is not configured', async () => {
        // If key IS configured, this test is skipped
        if (process.env.PLANT_ID_API_KEY) {
            console.log('Plant.id key is set — skipping no-key test')
            return
        }

        const pngBuffer = createMinimalPng()

        const res = await request(app)
            .post('/api/disease/analyze')
            .attach('image', pngBuffer, { filename: 'test_leaf.png', contentType: 'image/png' })
            .timeout(10000)

        expect(res.status).toBe(503)
        expect(res.body).toHaveProperty('error')
        expect(res.body.error).toMatch(/Plant.id API key not configured/i)
        expect(res.body).toHaveProperty('instructions')
        expect(res.body.instructions).toMatch(/web.plant.id/i)
    }, 12000)

    it('returns 415 when a non-image file is uploaded', async () => {
        const textBuffer = Buffer.from('this is not an image')

        const res = await request(app)
            .post('/api/disease/analyze')
            .attach('image', textBuffer, { filename: 'not_image.txt', contentType: 'text/plain' })
            .timeout(5000)

        expect(res.status).toBe(415)
        expect(res.body.error).toMatch(/Only image files/i)
    }, 8000)

    it('returns proper response shape when Plant.id key IS configured', async () => {
        if (!process.env.PLANT_ID_API_KEY) {
            console.log('Plant.id key not set — skipping live API test')
            return
        }

        const pngBuffer = createMinimalPng()

        const res = await request(app)
            .post('/api/disease/analyze')
            .attach('image', pngBuffer, { filename: 'leaf.png', contentType: 'image/png' })
            .timeout(35000)

        // Plant.id may return 400 for an invalid image but should not 500/503
        expect([200, 400, 422]).toContain(res.status)

        if (res.status === 200) {
            expect(res.body).toHaveProperty('isHealthy')
            expect(res.body).toHaveProperty('diseases')
            expect(Array.isArray(res.body.diseases)).toBe(true)
            expect(res.body.source).toMatch(/Plant.id/i)

            if (res.body.diseases.length > 0) {
                const disease = res.body.diseases[0]
                expect(disease).toHaveProperty('name')
                expect(disease).toHaveProperty('probability')
                expect(typeof disease.probability).toBe('number')
            }
        }
    }, 40000)
})
