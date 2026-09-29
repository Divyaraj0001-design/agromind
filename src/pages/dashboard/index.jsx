import { useState, useMemo } from 'react'
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
    Sprout, Droplets, Thermometer, Wind, TrendingUp,
    AlertTriangle, CheckCircle, Clock,
    Wheat, Sun, CloudRain, Eye, MapPin, Loader2, Settings2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import InfoModal from '../../components/modals/InfoModal'
import FarmPolygonDrawer from '../../components/FarmPolygonDrawer'
import LiveBadge from '../../components/LiveBadge'
import { useApi } from '../../hooks/useApi'

function polygonCentroid(polygon) {
    try {
        const geo = typeof polygon.geojson === 'string' ? JSON.parse(polygon.geojson) : polygon.geojson
        const ring = geo.coordinates[0] // [ [lon, lat], ... ]
        const pts = ring.slice(0, -1) // drop closing duplicate point
        const [sumLon, sumLat] = pts.reduce(([lo, la], [lon, lat]) => [lo + lon, la + lat], [0, 0])
        return { lat: sumLat / pts.length, lon: sumLon / pts.length }
    } catch {
        return null
    }
}

const riskColor = { Low: '#22c55e', Medium: '#f59e0b', High: '#ef4444' }

function LiveStatCard({ icon: Icon, label, loading, error, value, sub, color, onClick, notConfigured }) {
    return (
        <div className="stat-card" style={{ '--glow-color': color, cursor: onClick ? 'pointer' : 'default', transition: 'all 0.2s' }}
            onClick={onClick}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.02em' }}>{label}</span>
                        <LiveBadge color={color} />
                    </div>
                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
                            <Loader2 size={16} className="spin" /> <span style={{ fontSize: 13 }}>Fetching…</span>
                        </div>
                    ) : error ? (
                        <div style={{ fontSize: 12.5, color: notConfigured ? '#f59e0b' : '#ef4444', lineHeight: 1.4 }}>
                            {notConfigured ? '⚙️ API key not configured' : error}
                        </div>
                    ) : (
                        <>
                            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>{value}</div>
                            {sub && <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>}
                        </>
                    )}
                </div>
                <div style={{
                    width: 44, height: 44, flexShrink: 0,
                    background: `${color}1f`, borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Icon size={20} color={color} />
                </div>
            </div>
        </div>
    )
}

const yieldData = [
    { month: 'Sep', wheat: 42, rice: 38, corn: 55 },
    { month: 'Oct', wheat: 55, rice: 44, corn: 48 },
    { month: 'Nov', wheat: 63, rice: 52, corn: 61 },
    { month: 'Dec', wheat: 48, rice: 41, corn: 44 },
    { month: 'Jan', wheat: 71, rice: 59, corn: 68 },
    { month: 'Feb', wheat: 82, rice: 65, corn: 74 },
    { month: 'Mar', wheat: 76, rice: 71, corn: 80 },
]

const soilData = [
    { name: 'Nitrogen', value: 72, color: '#22c55e' },
    { name: 'Phosphorus', value: 58, color: '#38bdf8' },
    { name: 'Potassium', value: 84, color: '#f59e0b' },
    { name: 'pH Level', value: 66, color: '#a78bfa' },
]

const cropHealthData = [
    { name: 'Excellent', value: 42, color: '#22c55e' },
    { name: 'Good', value: 35, color: '#86efac' },
    { name: 'Fair', value: 16, color: '#f59e0b' },
    { name: 'Poor', value: 7, color: '#ef4444' },
]

const recentActivities = [
    { icon: Droplets, text: 'Irrigation triggered — Field A', time: '10 min ago', type: 'info', color: '#38bdf8', info: { title: 'Irrigation Triggered', icon: '💧', type: 'info', description: 'The AI system automatically triggered drip irrigation for Field A based on real-time soil moisture sensor data which dropped below the 40% threshold.', points: ['Soil moisture was at 38% (below 40% safe zone)', 'AI calculated 45 minutes of watering needed', 'Water saved vs manual irrigation: ~200L', 'Auto-shutoff scheduled at moisture level 70%'], tip: 'You can adjust auto-trigger thresholds in Irrigation Planner > Field Settings.' } },
    { icon: AlertTriangle, text: 'Low soil moisture — Field C', time: '45 min ago', type: 'warning', color: '#f59e0b', info: { title: 'Low Soil Moisture Alert', icon: '⚠️', type: 'warning', value: '28%', trend: '↓ Critical', description: 'Field C (Tomato crop, 3 acres) has critically low soil moisture at 28%. This is well below the recommended 45–65% range for tomatoes at fruiting stage.', points: ['Current moisture: 28% (Critical — below 35% danger zone)', 'Tomatoes in fruiting stage need more water', 'Risk of blossom drop and fruit crack if not irrigated', 'Suggested action: Irrigate for 60–90 minutes immediately'], tip: 'Go to Irrigation Planner → tap Field C → click "Irrigate Now" to fix this immediately.' } },
    { icon: CheckCircle, text: 'Disease scan complete — Wheat crop', time: '2h ago', type: 'success', color: '#22c55e', info: { title: 'AI Disease Scan Completed', icon: '🔬', type: 'success', value: 'Clear', description: 'The AI disease detection scan for your Wheat crop in Field A has completed. The scan analyzed 47 leaf images and found no active disease infection.', points: ['Scanned 47 leaf samples across Field A', 'No fungal, bacterial, or viral infection detected', 'Slight yellowing on 3% of leaves (nutrient deficiency, not disease)', 'Next scheduled scan: 7 days'], tip: 'Use Disease Detection page to run a new scan anytime, or upload a photo if you spot something unusual.' } },
    { icon: TrendingUp, text: 'Market price alert — Tomato +18%', time: '3h ago', type: 'success', color: '#22c55e', info: { title: 'Market Price Spike Alert', icon: '📈', type: 'success', value: '+18%', trend: '↑ High Opportunity', description: 'Tomato wholesale prices in your region have surged 18% in the last 24 hours due to unseasonal rainfall in Nashik and Pune growing regions.', points: ['Current market rate: ₹38/kg (up from ₹32/kg)', 'Demand spike from Bangalore & Chennai mandis', 'Estimated window: 5–8 days before new supply arrives', 'Your Field C (Tomato) is at fruiting stage — nearly harvest-ready'], tip: 'Visit Market Insights to see detailed price charts and set a sell-price alert for maximum profit timing.' } },
    { icon: Sun, text: 'Weather alert: Heat wave expected', time: '5h ago', type: 'warning', color: '#f59e0b', info: { title: 'Heat Wave Weather Alert', icon: '🌡️', type: 'warning', value: '42°C', trend: '↑ Next 3 days', description: 'IMD (Indian Meteorological Department) has issued a heat wave warning for your district. Temperatures expected to exceed 42°C for the next 3 days.', points: ['Peak temperature: 42°C (Tuesday–Thursday)', 'High UV index: 9/10 (very high)', 'Heat stress risk for Rice and Tomato crops', 'Recommended: Early morning irrigation (5–7 AM) to reduce evaporation'], tip: 'Check Weather Intelligence for hourly breakdown and farming advisories for each crop during the heat wave.' } },
]

const crops = [
    { name: 'Wheat', field: 'Field A (8 acres)', health: 92, stage: 'Flowering', daysLeft: 23, color: '#f59e0b', icon: '🌾' },
    { name: 'Rice', field: 'Field B (12 acres)', health: 78, stage: 'Tillering', daysLeft: 45, color: '#22c55e', icon: '🌱' },
    { name: 'Tomato', field: 'Field C (3 acres)', health: 65, stage: 'Fruiting', daysLeft: 18, color: '#ef4444', icon: '🍅' },
    { name: 'Corn', field: 'Field D (6 acres)', health: 88, stage: 'Tasseling', daysLeft: 31, color: '#a78bfa', icon: '🌽' },
]

const cropInfoMap = {
    Wheat: { title: 'Wheat — Field A', icon: '🌾', type: 'warning', value: '92% Health', trend: '↑ Excellent', description: 'Your wheat crop in Field A is in excellent health and currently at the Flowering stage — one of the most important phases for grain formation.', points: ['At 92% health — no disease or pest issues detected', 'Flowering stage: critical for grain yield (next 7–10 days)', 'Current temperature is ideal (24–28°C) for wheat pollination', 'Expected harvest in 23 days — Field A (8 acres)'], tip: 'Avoid excessive irrigation during flowering. Also avoid spraying pesticides as it can harm natural pollinators.' },
    Rice: { title: 'Rice — Field B', icon: '🌱', type: 'info', value: '78% Health', trend: '~ Moderate', description: 'Your rice crop in Field B is in moderate health and currently at the Tillering stage — when the plant grows extra stems (tillers) that become rice panicles.', points: ['At 78% health — slight nitrogen deficiency detected', 'Tillering stage: number of tillers = number of grain panicles', 'Moisture needs: flooded or saturated soil (5–7cm water depth)', 'Expected harvest in 45 days — Field B (12 acres)'], tip: 'Apply 20kg Urea per acre in the next 5 days to boost nitrogen and increase tiller count for higher yield.' },
    Tomato: { title: 'Tomato — Field C', icon: '🍅', type: 'danger', value: '65% Health', trend: '↓ Needs Attention', description: 'Your tomato crop in Field C needs immediate attention. At 65% health during the critical Fruiting stage, yield may be severely impacted without action.', points: ['At 65% health — soil moisture critically low (28%)', 'Fruiting stage: needs most water and nutrients of entire cycle', 'Risk of blossom end rot due to calcium deficiency (water stress)', 'Market prices are high right now — act fast to protect revenue'], tip: 'Irrigate immediately, then in 3 days, apply calcium-rich foliar spray (CaNO3) to prevent blossom end rot.' },
    Corn: { title: 'Corn — Field D', icon: '🌽', type: 'purple', value: '88% Health', trend: '↑ Good', description: 'Your corn crop in Field D is in good health at the Tasseling stage — when the male flower (tassel) forms at the top and pollen begins to shed.', points: ['At 88% health — growing well, minor potassium deficiency', 'Tasseling stage: pollen shed next 7–10 days is critical for yield', 'High temperature can reduce pollen viability (> 35°C is risky)', 'Expected harvest in 31 days — Field D (6 acres)'], tip: 'Ensure consistent watering during tasseling and silking (next 3 weeks). Apply MOP fertilizer for potassium.' },
}

const weather = [
    { day: 'Today', icon: Sun, temp: 28, type: 'Sunny', humidity: 62 },
    { day: 'Wed', icon: CloudRain, temp: 22, type: 'Rain', humidity: 85 },
    { day: 'Thu', icon: Sun, temp: 30, type: 'Sunny', humidity: 55 },
    { day: 'Fri', icon: Sun, temp: 29, type: 'Partly Cloudy', humidity: 60 },
    { day: 'Sat', icon: CloudRain, temp: 24, type: 'Showers', humidity: 90 },
]

const weatherInfoMap = {
    Today: { title: 'Today — Sunny, 28°C', icon: '☀️', type: 'success', value: '28°C', description: 'Current weather conditions in Amritsar, Punjab. Sunny with mild breeze — ideal for most farming activities.', points: ['Temperature: 28°C (comfortable for field work)', 'Humidity: 62% — moderate, low disease risk', 'Wind: 14 km/h from NW — suitable for spraying', 'UV Index: 7 — wear sun protection if working outdoors'], tip: 'Great day for pesticide/fertilizer spraying before 10 AM. Avoid spraying in afternoon heat.' },
    Wed: { title: 'Wednesday — Rainy, 22°C', icon: '🌧️', type: 'info', value: '22°C', description: 'Rain expected on Wednesday. Good natural irrigation but may delay field activities.', points: ['Expected rainfall: 15–25mm', 'Humidity will spike to 85% — watch for fungal diseases', 'Avoid pesticide spraying (rain washes it off)', 'Rice and green vegetables will benefit from natural rain'], tip: 'After rain, inspect crops for early symptoms of blight or fungal infection. Humidity >80% increases disease risk.' },
    Sat: { title: 'Saturday — Showers, 24°C', icon: '🌦️', type: 'warning', value: '24°C', description: 'Light showers expected on Saturday. High humidity may increase fungal disease pressure on crops.', points: ['Humidity: 90% — very high fungal risk', 'Light showers: sporadic, not reliable for irrigation', 'Suitable for transplanting seedlings after rain', 'Rice paddy: no pumping needed — save water & electricity'], tip: 'Pre-treat susceptible crops (tomato, grapes) with a preventive copper fungicide spray on Friday before showers.' },
}

const soilInfoMap = {
    Nitrogen: { title: 'Nitrogen (N) Level', icon: '🌿', type: 'success', value: '72%', trend: '~ Normal', description: 'Nitrogen is the most critical macronutrient for plant growth. It is responsible for green leaf growth, protein production, and overall plant vigor.', points: ['72% is in the healthy range (ideal: 65–80%)', 'Low nitrogen causes yellowing leaves (chlorosis)', 'Too much causes excessive leafy growth with less fruit/grain', 'Regularly replenished by organic manure or Urea fertilizer'], tip: 'Maintain with organic compost or split Urea application. Avoid single large doses — split into 2–3 applications.' },
    Phosphorus: { title: 'Phosphorus (P) Level', icon: '🌸', type: 'warning', value: '58%', trend: '↓ Below Optimal', description: 'Phosphorus is essential for root development, flowering, and seed formation. It helps plants convert other nutrients into usable energy.', points: ['58% is slightly below optimal range (ideal: 65–75%)', 'Low phosphorus delays flowering and reduces fruit set', 'Critical for seedling root development', 'Apply DAP (Di-Ammonium Phosphate) to replenish levels'], tip: 'Apply DAP @ 25kg per acre this week. Best time: just before irrigation so it dissolves into root zone.' },
    Potassium: { title: 'Potassium (K) Level', icon: '💪', type: 'success', value: '84%', trend: '↑ Excellent', description: 'Potassium strengthens plant cell walls, improves disease resistance, enhances fruit quality, and regulates water use efficiency.', points: ['84% is excellent (ideal: 75–90%)', 'High K = stronger stems, better drought resistance', 'Improves fruit color, size, and shelf life in tomato/corn', 'Helps crops survive stress (heat, drought, disease)'], tip: 'Levels are great! Maintain with MOP (Muriate of Potash) at next season sowing. No immediate action needed.' },
    'pH Level': { title: 'Soil pH Level', icon: '⚗️', type: 'purple', value: '6.6 pH', trend: '~ Optimal', description: 'Soil pH measures how acidic or alkaline your soil is on a scale of 1–14. Most crops grow best in the 6.0–7.5 range.', points: ['pH 6.6 is ideal — right in the sweet spot for most crops', 'Balanced pH = nutrients are maximally available to roots', 'Too acidic (< 5.5): nutrients locked up, aluminium toxicity', 'Too alkaline (> 7.5): iron, zinc, manganese become unavailable'], tip: 'Your pH is perfect. Test again after monsoon — heavy rainfall can acidify soil over time. Target: 6.0–7.0.' },
}

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: '#1a2e1a', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, padding: '10px 14px',
            }}>
                <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ fontSize: 13, color: p.color, fontWeight: 600 }}>
                        {p.name}: {p.value}t
                    </p>
                ))}
            </div>
        )
    }
    return null
}

export default function Dashboard() {
    const [activeField, setActiveField] = useState(null)
    const [modal, setModal] = useState(null)
    const [showDrawer, setShowDrawer] = useState(false)
    const navigate = useNavigate()

    const cardHover = {
        onMouseEnter: e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)' },
        onMouseLeave: e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '' },
    }

    const { data: polygonsData, loading: polyLoading, refetch: refetchPolygons } = useApi('/api/ndvi/polygons')
    const activePolygon = polygonsData?.polygons?.[0]
    const center = useMemo(() => (activePolygon ? polygonCentroid(activePolygon) : null), [activePolygon])

    const { data: ndviData, loading: ndviLoading, error: ndviError } = useApi(
        activePolygon ? `/api/ndvi/stats?polygonId=${activePolygon.id}` : '/api/ndvi/stats',
        { skip: !activePolygon }
    )
    const { data: weatherData, loading: weatherLoading, error: weatherError } = useApi(
        center ? `/api/weather/advisory?lat=${center.lat}&lon=${center.lon}` : '/api/weather/advisory'
    )

    const ndviNotConfigured = ndviError?.toLowerCase().includes('not configured') || ndviError?.toLowerCase().includes('not yet registered')

    return (
        <div style={{ padding: '28px' }} className="page-enter">
            {modal && <InfoModal data={modal} onClose={() => setModal(null)} />}
            {showDrawer && (
                <FarmPolygonDrawer
                    onClose={() => setShowDrawer(false)}
                    onSaved={() => { setShowDrawer(false); refetchPolygons() }}
                />
            )}

            {!polyLoading && !activePolygon && (
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                    background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
                    borderRadius: 12, padding: '14px 20px', marginBottom: 24,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <MapPin size={18} color="#22c55e" />
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Set up your field to unlock live crop health, soil & weather data</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Draw your field boundary once — takes under a minute.</div>
                        </div>
                    </div>
                    <button onClick={() => setShowDrawer(true)} style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8,
                        background: '#22c55e', color: '#052e0f', fontWeight: 700, border: 'none', cursor: 'pointer', flexShrink: 0,
                    }}>
                        <Settings2 size={14} /> Set Up Field
                    </button>
                </div>
            )}

            {/* STAT CARDS — LIVE */}
            <div className="grid-3" style={{ marginBottom: 24 }}>
                <LiveStatCard
                    icon={Sprout}
                    label="Crop Health (NDVI)"
                    color="#34d399"
                    loading={activePolygon ? ndviLoading : polyLoading}
                    error={!activePolygon ? 'Set up a field to see this' : (ndviData?.ndvi?.error || ndviError)}
                    notConfigured={ndviNotConfigured}
                    value={ndviData?.ndvi?.healthPercent != null ? `${ndviData.ndvi.healthPercent}%` : '—'}
                    sub={ndviData?.ndvi?.interpretation ? `${ndviData.ndvi.interpretation} · Agromonitoring` : null}
                    onClick={() => activePolygon && ndviData?.ndvi && setModal({
                        title: 'Crop Health (NDVI)', icon: '🌱', type: 'success',
                        value: `${ndviData.ndvi.healthPercent}%`,
                        description: 'NDVI (Normalized Difference Vegetation Index) measures vegetation greenness from satellite imagery, scaled 0-100% as a crop health indicator.',
                        points: [`Raw NDVI: ${ndviData.ndvi.raw}`, `Interpretation: ${ndviData.ndvi.interpretation}`, `Field: ${ndviData.fieldName}`],
                        tip: 'Source: Agromonitoring satellite imagery API.',
                    })}
                />
                <LiveStatCard
                    icon={Droplets}
                    label="Soil Moisture"
                    color="#38bdf8"
                    loading={activePolygon ? ndviLoading : polyLoading}
                    error={!activePolygon ? 'Set up a field to see this' : (ndviData?.soil?.error || ndviError)}
                    notConfigured={ndviNotConfigured}
                    value={ndviData?.soil?.moisturePercent != null ? `${ndviData.soil.moisturePercent}%` : '—'}
                    sub={ndviData?.soil?.status ? `${ndviData.soil.status} · Agromonitoring` : null}
                    onClick={() => activePolygon && ndviData?.soil && setModal({
                        title: 'Soil Moisture', icon: '💧', type: 'info',
                        value: `${ndviData.soil.moisturePercent}%`,
                        description: 'Soil moisture measured at 0-10cm depth via satellite/sensor data.',
                        points: [`Status: ${ndviData.soil.status}`, ndviData.soil.temperature10cm != null ? `Soil temp (10cm): ${ndviData.soil.temperature10cm}°C` : null].filter(Boolean),
                        tip: 'Source: Agromonitoring soil API.',
                    })}
                />
                <LiveStatCard
                    icon={weatherData?.risk === 'High' ? AlertTriangle : Sun}
                    label="Weather Risk"
                    color={riskColor[weatherData?.risk] || '#f59e0b'}
                    loading={weatherLoading}
                    error={weatherError}
                    value={weatherData?.risk || '—'}
                    sub={weatherData?.current ? `${weatherData.current.temperature}°C · ${weatherData.current.weatherLabel}` : null}
                    onClick={() => weatherData && setModal({
                        title: "Today's Weather Advisory", icon: '🌤️', type: weatherData.risk === 'High' ? 'danger' : weatherData.risk === 'Medium' ? 'warning' : 'success',
                        value: weatherData.risk,
                        description: weatherData.advisory,
                        points: [
                            `Temperature: ${weatherData.current.temperature}°C (feels like ${weatherData.current.feelsLike}°C)`,
                            `Humidity: ${weatherData.current.humidity}%`,
                            `Wind: ${weatherData.current.windSpeed} km/h`,
                        ],
                        tip: 'Source: Open-Meteo forecast API.',
                    })}
                />
            </div>

            {/* ROW 2: CHARTS */}
            <div className="grid-2" style={{ marginBottom: 24, gridTemplateColumns: '2fr 1fr' }}>
                {/* Yield Trend */}
                <div className="card" style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    onClick={() => setModal({
                        title: 'Crop Yield Trends', icon: '📊', type: 'success', subtitle: 'Tonnes per acre — last 7 months',
                        value: '↑ 76t avg', trend: '+14% vs last season',
                        description: 'This area chart shows how your crop yield (in tonnes per acre) has changed over the past 7 months for your 3 main crops: Wheat, Rice, and Corn.',
                        points: [
                            'Wheat (orange): peaked at 82t in February — best performing month',
                            'Rice (green): steady growth — now at 71t (up from 38t in Sep)',
                            'Corn (purple): highest yield in March at 80t/acre',
                            'Overall trend: upward — AI irrigation and crop advice is working'
                        ],
                        tip: 'Hover over the chart to see exact values for each month. Consistency in yield means your soil health is improving.'
                    })}
                    {...cardHover}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Crop Yield Trends</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Tonnes per acre (last 7 months) · Click for details</div>
                        </div>
                        <div className="badge badge-green">Live</div>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={yieldData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                            <defs>
                                <linearGradient id="wheat" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="rice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="corn" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="wheat" name="Wheat" stroke="#f59e0b" strokeWidth={2} fill="url(#wheat)" />
                            <Area type="monotone" dataKey="rice" name="Rice" stroke="#22c55e" strokeWidth={2} fill="url(#rice)" />
                            <Area type="monotone" dataKey="corn" name="Corn" stroke="#a78bfa" strokeWidth={2} fill="url(#corn)" />
                        </AreaChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', gap: 20, marginTop: 12, flexWrap: 'wrap' }}>
                        {[['Wheat', '#f59e0b'], ['Rice', '#22c55e'], ['Corn', '#a78bfa']].map(([name, color]) => (
                            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Crop Health Pie */}
                <div className="card" style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    onClick={() => setModal({
                        title: 'Crop Health Distribution', icon: '🥧', type: 'success', subtitle: 'All fields combined',
                        value: '77% Healthy+', trend: '↑ Improving',
                        description: 'This donut chart shows the health distribution of all crops across your 4 fields. A higher "Excellent" percentage means more productive harvests.',
                        points: [
                            '42% Excellent — mostly Wheat (Field A) and Corn (Field D)',
                            '35% Good — Rice (Field B) is in this range',
                            '16% Fair — Tomato (Field C) needs attention',
                            '7% Poor — specific sections in Field C with water stress'
                        ],
                        tip: 'Click individual crops in Active Crops section to get specific advice for improving each crop\'s health score.'
                    })}
                    {...cardHover}
                >
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Crop Health</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Distribution across all fields · Click for details</div>
                    <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                            <Pie data={cropHealthData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                                {cropHealthData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(val) => [`${val}%`, '']} contentStyle={{ background: '#1a2e1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                        {cropHealthData.map((d, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.name}</span>
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{d.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ROW 3: Crops + Weather */}
            <div className="grid-2" style={{ marginBottom: 24, gridTemplateColumns: '1fr 1fr' }}>
                {/* Active Crops */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Active Crops</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>4 fields in cultivation · Click any crop for details</div>
                        </div>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/app/records')}>View All</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {crops.map((crop, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: 14,
                                padding: '12px 14px',
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: 10, border: '1px solid var(--border-subtle)',
                                cursor: 'pointer', transition: 'all 0.2s',
                            }}
                                onClick={() => setModal(cropInfoMap[crop.name])}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
                            >
                                <span style={{ fontSize: 22 }}>{crop.icon}</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <div>
                                            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{crop.name}</span>
                                            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>{crop.field}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Clock size={11} color="var(--text-muted)" />
                                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{crop.daysLeft}d</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div className="progress-bar" style={{ flex: 1, height: 4 }}>
                                            <div className="progress-fill" style={{
                                                width: `${crop.health}%`,
                                                background: crop.health > 80 ? 'linear-gradient(90deg, #22c55e, #4ade80)' :
                                                    crop.health > 65 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' :
                                                        'linear-gradient(90deg, #ef4444, #f87171)',
                                            }} />
                                        </div>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: crop.color, flexShrink: 0 }}>{crop.health}%</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Weather + Soil */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Weather */}
                    <div className="card weather-gradient" style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <div>
                                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Current Weather</div>
                                <div style={{ fontSize: 32, fontWeight: 800, color: 'white', letterSpacing: '-0.04em' }}>28°C</div>
                                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Sunny · Amritsar, Punjab</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Droplets size={12} /> 62%
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Wind size={12} /> 14km/h
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {weather.map((w, i) => (
                                <div key={i} style={{
                                    flex: 1, textAlign: 'center',
                                    padding: '10px 4px',
                                    borderRadius: 8,
                                    background: i === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)',
                                    cursor: 'pointer', transition: 'all 0.15s',
                                }}
                                    onClick={() => setModal(weatherInfoMap[w.day] || {
                                        title: `${w.day} — ${w.type}`, icon: w.type.includes('Rain') ? '🌧️' : '☀️', type: 'info',
                                        value: `${w.temp}°C`, description: `${w.day}: ${w.type} conditions expected. Temperature ${w.temp}°C with ${w.humidity}% humidity.`,
                                        points: [`Temperature: ${w.temp}°C`, `Humidity: ${w.humidity}%`, `Conditions: ${w.type}`, w.humidity > 80 ? 'High humidity — watch for fungal disease' : 'Humidity levels comfortable for crops'],
                                        tip: 'Visit Weather Intelligence for detailed 7-day forecast with farming-specific advisories.'
                                    })}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                                    onMouseLeave={e => e.currentTarget.style.background = i === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)'}
                                >
                                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>{w.day}</div>
                                    <w.icon size={18} color={w.type === 'Rain' || w.type === 'Showers' ? '#93c5fd' : '#fbbf24'} />
                                    <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginTop: 6 }}>{w.temp}°</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Soil Nutrients */}
                    <div className="card" style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Soil Nutrients</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Field A · Click any nutrient for details</div>
                        {soilData.map((s, i) => (
                            <div key={i} style={{ marginBottom: 12, cursor: 'pointer', padding: '6px 8px', borderRadius: 8, transition: 'background 0.15s' }}
                                onClick={() => setModal(soilInfoMap[s.name])}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.name}</span>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.value}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${s.value}%`, background: `linear-gradient(90deg, ${s.color}, ${s.color}99)` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ROW 4: Activity */}
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Recent Activity</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Farm events and AI alerts · Click any for full details</div>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => toast('📋 Full activity log view coming soon!', { duration: 2000 })}>
                        <Eye size={14} /> View All
                    </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {recentActivities.map((a, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: 14,
                            padding: '12px 14px',
                            borderRadius: 10,
                            transition: 'background 0.2s',
                            cursor: 'pointer',
                        }}
                            onClick={() => setModal(a.info)}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <div style={{
                                width: 36, height: 36,
                                background: `${a.color}18`,
                                borderRadius: 10,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <a.icon size={16} color={a.color} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{a.text}</span>
                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>Click to see full details & recommendations</div>
                            </div>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>{a.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
