/**
 * routes/weather.js
 * Open-Meteo API — Free, no API key required.
 * https://open-meteo.com/en/docs
 *
 * Provides:
 *   GET /api/weather/advisory?lat=&lon=
 *   → weather risk level + AI-generated advisory text
 */

const express = require('express')
const router = express.Router()
// Uses Node 18+ global fetch — no require('node-fetch') needed

// WMO Weather Code → human label mapping (subset)
const WMO_CODES = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Icy fog',
    51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
    61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
    71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
    80: 'Light showers', 81: 'Showers', 82: 'Violent showers',
    95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Heavy thunderstorm',
}

/**
 * Compute a weather risk level from forecast data.
 * Returns 'Low' | 'Medium' | 'High'
 */
function computeWeatherRisk(current, daily) {
    let score = 0

    // Temperature extremes
    const temp = current.temperature_2m
    if (temp > 40 || temp < 5) score += 3
    else if (temp > 35 || temp < 10) score += 1

    // High wind
    const wind = current.wind_speed_10m
    if (wind > 50) score += 3
    else if (wind > 30) score += 1

    // Precipitation intensity
    const precip = current.precipitation || 0
    if (precip > 20) score += 3
    else if (precip > 5) score += 1

    // Next 24h: rain sum
    const rain24h = daily?.precipitation_sum?.[0] || 0
    if (rain24h > 30) score += 2
    else if (rain24h > 10) score += 1

    // WMO code severity
    const code = current.weather_code
    if ([95, 96, 99].includes(code)) score += 4
    else if ([80, 81, 82].includes(code)) score += 2

    if (score >= 5) return 'High'
    if (score >= 2) return 'Medium'
    return 'Low'
}

/**
 * Generate a practical farming advisory from real weather data.
 * No LLM — rule-based advisory generation from actual conditions.
 */
function generateAdvisory(current, daily, risk) {
    const temp = current.temperature_2m
    const humidity = current.relative_humidity_2m
    const wind = current.wind_speed_10m
    const code = current.weather_code
    const rain24h = daily?.precipitation_sum?.[0] || 0

    const tips = []

    if (risk === 'High') {
        tips.push('⚠️ High weather risk today. Avoid field operations.')
    }

    if (temp > 38) {
        tips.push(`🌡️ Extreme heat (${temp}°C) — irrigate early morning (5–7 AM) to reduce evaporation by 40%.`)
    } else if (temp < 10) {
        tips.push(`🥶 Near-frost conditions (${temp}°C) — cover frost-sensitive crops (tomato, chilli) overnight.`)
    } else {
        tips.push(`🌡️ Temperature ${temp}°C — suitable for most field activities.`)
    }

    if (humidity > 85) {
        tips.push(`💧 Humidity ${humidity}% — very high fungal disease risk. Avoid irrigating tonight; inspect for early blight.`)
    } else if (humidity < 30) {
        tips.push(`🏜️ Low humidity (${humidity}%) — increase irrigation frequency; watch for spider mites.`)
    }

    if (wind > 30) {
        tips.push(`💨 Strong winds (${wind} km/h) — postpone pesticide/herbicide spraying to avoid drift.`)
    } else if (wind < 15) {
        tips.push(`🌬️ Light wind (${wind} km/h) — ideal conditions for foliar spray if needed.`)
    }

    if (rain24h > 20) {
        tips.push(`🌧️ Heavy rain expected (${rain24h}mm) — ensure field drainage is clear; delay fertilizer application.`)
    } else if (rain24h > 5 && rain24h <= 20) {
        tips.push(`🌦️ Light rain expected (${rain24h}mm) — skip scheduled irrigation today; save water.`)
    } else if (rain24h === 0) {
        tips.push(`☀️ No rain forecast — proceed with planned irrigation schedule.`)
    }

    if ([95, 96, 99].includes(code)) {
        tips.push('⛈️ Thunderstorm alert — secure farm equipment and stay indoors.')
    }

    return tips.join(' | ')
}

/**
 * GET /api/weather/advisory
 * Query params: lat (float), lon (float)
 * Falls back to Pune, India if not provided (for demo)
 */
router.get('/advisory', async (req, res) => {
    const lat = parseFloat(req.query.lat) || 18.52
    const lon = parseFloat(req.query.lon) || 73.85

    const url = new URL('https://api.open-meteo.com/v1/forecast')
    url.searchParams.set('latitude', lat)
    url.searchParams.set('longitude', lon)
    url.searchParams.set('current', [
        'temperature_2m', 'relative_humidity_2m', 'precipitation',
        'weather_code', 'wind_speed_10m', 'apparent_temperature'
    ].join(','))
    url.searchParams.set('daily', [
        'weather_code', 'temperature_2m_max', 'temperature_2m_min',
        'precipitation_sum', 'wind_speed_10m_max'
    ].join(','))
    url.searchParams.set('timezone', 'auto')
    url.searchParams.set('forecast_days', '5')

    try {
        const response = await fetch(url.toString(), {
            headers: { 'User-Agent': 'AgroMind/1.0' },
            timeout: 8000,
        })

        if (!response.ok) {
            const text = await response.text()
            return res.status(502).json({
                error: 'Open-Meteo API returned an error',
                detail: text.slice(0, 200),
            })
        }

        const data = await response.json()
        const current = data.current
        const daily = data.daily

        const risk = computeWeatherRisk(current, daily)
        const advisory = generateAdvisory(current, daily, risk)

        // Build 5-day forecast for frontend
        const forecast = (daily.time || []).slice(0, 5).map((date, i) => ({
            date,
            code: daily.weather_code[i],
            label: WMO_CODES[daily.weather_code[i]] || 'Unknown',
            tempMax: daily.temperature_2m_max[i],
            tempMin: daily.temperature_2m_min[i],
            rain: daily.precipitation_sum[i],
            windMax: daily.wind_speed_10m_max[i],
        }))

        return res.json({
            lat, lon,
            current: {
                temperature: current.temperature_2m,
                feelsLike: current.apparent_temperature,
                humidity: current.relative_humidity_2m,
                precipitation: current.precipitation,
                windSpeed: current.wind_speed_10m,
                weatherCode: current.weather_code,
                weatherLabel: WMO_CODES[current.weather_code] || 'Unknown',
            },
            risk,
            advisory,
            forecast,
            source: 'Open-Meteo (open-meteo.com)',
            timestamp: new Date().toISOString(),
        })
    } catch (err) {
        if (err.type === 'request-timeout' || err.name === 'AbortError') {
            return res.status(504).json({ error: 'Weather API request timed out. Please try again.' })
        }
        console.error('Weather advisory error:', err.message)
        return res.status(500).json({ error: 'Failed to fetch weather data. Please try again later.' })
    }
})

module.exports = router
