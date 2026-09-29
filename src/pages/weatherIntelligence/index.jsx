import { useState } from 'react'
import {
    Cloud, Sun, CloudRain, Wind, Droplets, Eye, Thermometer,
    ArrowUp, ArrowDown, AlertTriangle, ChevronRight, Sunrise, Sunset
} from 'lucide-react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer
} from 'recharts'
import InfoModal from '../../components/modals/InfoModal'

const hourlyData = [
    { time: '6 AM', temp: 22, humidity: 75, rain: 0 },
    { time: '9 AM', temp: 25, humidity: 68, rain: 0 },
    { time: '12 PM', temp: 30, humidity: 55, rain: 0 },
    { time: '3 PM', temp: 32, humidity: 48, rain: 0 },
    { time: '6 PM', temp: 28, humidity: 62, rain: 0 },
    { time: '9 PM', temp: 24, humidity: 70, rain: 0 },
    { time: '12 AM', temp: 20, humidity: 80, rain: 5 },
    { time: '3 AM', temp: 18, humidity: 85, rain: 12 },
]

const weekForecast = [
    { day: 'Monday', date: 'Mar 10', icon: Sun, high: 32, low: 20, cond: 'Sunny', humidity: 48, wind: '12 km/h', rain: '0%', farm: 'Good day for spraying fertilizer' },
    { day: 'Tuesday', date: 'Mar 11', icon: Sun, high: 30, low: 22, cond: 'Partly Cloudy', humidity: 54, wind: '8 km/h', rain: '5%', farm: 'Ideal for sowing seeds' },
    { day: 'Wednesday', date: 'Mar 12', icon: CloudRain, high: 24, low: 18, cond: 'Heavy Rain', humidity: 88, wind: '22 km/h', rain: '90%', farm: '⚠️ Avoid field work — high rain' },
    { day: 'Thursday', date: 'Mar 13', icon: Cloud, high: 26, low: 19, cond: 'Overcast', humidity: 72, wind: '14 km/h', rain: '20%', farm: 'Light activity okay' },
    { day: 'Friday', date: 'Mar 14', icon: Sun, high: 29, low: 18, cond: 'Sunny', humidity: 50, wind: '10 km/h', rain: '2%', farm: 'Excellent for harvesting' },
    { day: 'Saturday', date: 'Mar 15', icon: Sun, high: 31, low: 20, cond: 'Sunny', humidity: 45, wind: '7 km/h', rain: '0%', farm: 'Good day for irrigation' },
    { day: 'Sunday', date: 'Mar 16', icon: CloudRain, high: 23, low: 17, cond: 'Showers', humidity: 82, wind: '18 km/h', rain: '65%', farm: 'Check drain health before rain' },
]

const alerts = [
    { type: 'warning', text: 'Heavy rain expected Wednesday. Protect newly sown fields.', icon: CloudRain, color: '#38bdf8' },
    { type: 'warning', text: 'High wind speeds (22 km/h) on Wed — avoid spraying pesticides.', icon: Wind, color: '#a78bfa' },
    { type: 'success', text: 'Optimal conditions for harvesting wheat on Friday.', icon: Sun, color: '#f59e0b' },
]

const alertInfoMap = [
    { title: 'Heavy Rain Alert — Wednesday', icon: '🌧️', type: 'warning', value: '90% chance', trend: '⚠️ Prepare Now', description: 'Heavy rainfall is forecast for Wednesday (Mar 12). Rainfall intensity: 25–40mm. This can waterlog fields, wash away fertilizer, and trigger disease.', points: ['Rainfall: 25–40mm expected over 6–8 hours', 'Fields with poor drainage risk waterlogging', 'Freshly applied fertilizers will wash away — delay application', 'Fungal disease pressure will spike after rain — inspect crops Thursday'], tip: 'Before Wednesday: apply preventive copper fungicide on tomato/pepper crops. After rain: check field drainage channels are clear.' },
    { title: 'High Wind Warning — Wednesday', icon: '💨', type: 'warning', value: '22 km/h', trend: '⚠️ Spraying Ban', description: 'Wind speeds will reach 22 km/h on Wednesday — above the safe limit for pesticide/herbicide spraying.', points: ['22 km/h winds cause spray drift (chemicals reach non-target areas)', 'Legal in most states: max spraying wind = 15 km/h', 'Risk of chemical drift onto neighboring fields/water bodies', 'High winds + rain = double reason to pause spraying'], tip: 'Reschedule all spraying to Monday or Friday when winds drop below 10 km/h. Plan applications accordingly.' },
    { title: 'Harvest Advisory — Friday', icon: '🌾', type: 'success', value: '29°C Sunny', trend: '✓ Prime Day', description: 'Friday (Mar 14) will have ideal conditions for wheat and other grain harvest operations — low humidity, low rain chance, and good visibility.', points: ['Temperature: 29°C — comfortable for field workers', 'Humidity: 50% — grain drying will be efficient', 'Rain chance: 2% — safe to cut and lay grain on field', 'Wind: 10 km/h — ideal for manual/combine harvesting'], tip: 'Prepare your combine harvester by Thursday. Start harvesting at 9 AM when morning dew has dried off the grain stalks.' },
]

const weatherMetricInfo = {
    Humidity: { title: 'Air Humidity', icon: '💧', type: 'info', value: '48%', description: 'Humidity is the amount of water vapor in the air. For farming, it directly affects crop disease risk and plant water uptake.', points: ['48% is moderate — comfortable for most crops', 'Above 80%: high fungal disease risk (blight, mildew)', 'Below 30%: plant stress, increased water loss from leaves', 'Wheat & corn prefer 40–65% humidity during grain fill'], tip: 'If humidity exceeds 75% for 2+ days, consider preventive fungicide spray on susceptible crops like tomato and grapes.' },
    Wind: { title: 'Wind Speed', icon: '💨', type: 'info', value: '12 km/h', description: 'Wind speed affects chemical spraying, pollination, evaporation, and plant stress. Moderate winds are beneficial; high winds are damaging.', points: ['12 km/h is ideal for natural pollination of wheat & corn', 'Safe spraying window: winds < 15 km/h (no drift)', 'High winds (> 30 km/h) can lodge crops (flatten stems)', 'Wind also helps dry foliage, reducing fungal risk after rain'], tip: 'Always check wind speed before applying pesticides or herbicides. Spray early morning when winds are usually calmer.' },
    Visibility: { title: 'Visibility', icon: '👁️', type: 'info', value: '10 km', description: 'Visibility of 10 km means clear air with no haze, fog, or smoke. Excellent conditions for field scouting and drone operations.', points: ['10 km visibility = excellent, clear sky conditions', 'Low visibility (< 1 km) indicates fog — avoid tractor field work', 'Good visibility days are ideal for drone crop monitoring', 'Smoke or dust haze can reduce photosynthesis in crops'], tip: 'Use clear-visibility days (like today) to fly your drone for field scouting and identify pest/disease hotspots visually.' },
    'UV Index': { title: 'UV Index — 8 High', icon: '🌞', type: 'warning', value: 'UV 8/10', trend: '⚠️ High', description: 'UV Index measures the strength of ultraviolet radiation from the sun. UV 8 is "Very High" — it affects both humans and plant biology.', points: ['UV 8 = Very High — avoid sun exposure 11AM–3PM', 'High UV can bleach and damage young seedlings', 'Increases evaporation from soil — irrigate early morning', 'Beneficial: kills some surface fungi and bacteria on leaves'], tip: 'Irrigate early morning (before 8 AM) to reduce evaporation. Cover seedling beds with shade nets (30–50% shade) on high UV days.' },
}

export default function WeatherIntelligence() {
    const [modal, setModal] = useState(null)

    return (
        <div style={{ padding: 28 }} className="page-enter">
            {modal && <InfoModal data={modal} onClose={() => setModal(null)} />}

            {/* Current Weather Hero */}
            <div style={{
                borderRadius: 'var(--radius-xl)',
                background: 'linear-gradient(135deg, #0f3460 0%, #16213e 50%, #1a472a 100%)',
                padding: '32px 36px',
                marginBottom: 24,
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.08)',
            }}>
                {/* BG circles */}
                <div style={{
                    position: 'absolute', right: -40, top: -40,
                    width: 240, height: 240,
                    background: 'radial-gradient(circle, rgba(251,191,36,0.1) 0%, transparent 70%)',
                    borderRadius: '50%', pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute', right: 60, bottom: -20,
                    width: 160, height: 160,
                    background: 'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)',
                    borderRadius: '50%', pointerEvents: 'none',
                }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                    <div>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>
                            📍 Amritsar, Punjab · Updated 5 min ago
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                            <div style={{ fontSize: 72, fontWeight: 900, color: 'white', letterSpacing: '-0.05em', lineHeight: 1 }}>
                                32°
                            </div>
                            <div>
                                <div style={{ fontSize: 20, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Sunny</div>
                                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                                    Feels like 34° · H:32° L:20°
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 24, marginTop: 20 }}>
                            {[
                                { icon: Droplets, label: 'Humidity', val: '48%' },
                                { icon: Wind, label: 'Wind', val: '12 km/h' },
                                { icon: Eye, label: 'Visibility', val: '10 km' },
                                { icon: Thermometer, label: 'UV Index', val: '8 High' },
                            ].map((m, i) => (
                                <div key={i} style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: 8, transition: 'background 0.15s' }}
                                    onClick={() => setModal(weatherMetricInfo[m.label])}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 3 }}>
                                        <m.icon size={12} /> {m.label}
                                    </div>
                                    <div style={{ fontSize: 15, fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        {m.val}
                                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>ⓘ</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                                <Sunrise size={16} color="#fbbf24" /> Sunrise 6:24 AM
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                                <Sunset size={16} color="#fb923c" /> Sunset 6:48 PM
                            </div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <Sun size={72} color="#fbbf24" opacity={0.9} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 16, alignItems: 'flex-end' }}>
                            <span className="badge badge-green">🌿 Good farming conditions</span>
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Dew Point: 18°C</span>
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Pressure: 1013 hPa</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Weather Alerts */}
            {alerts.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                    {alerts.map((a, i) => (
                        <div key={i} style={{
                            padding: '12px 16px',
                            background: `rgba(${a.type === 'warning' ? '245,158,11' : '34,197,94'},0.08)`,
                            border: `1px solid rgba(${a.type === 'warning' ? '245,158,11' : '34,197,94'},0.2)`,
                            borderRadius: 'var(--radius-md)',
                            display: 'flex', alignItems: 'center', gap: 12,
                            cursor: 'pointer', transition: 'all 0.15s',
                        }}
                            onClick={() => setModal(alertInfoMap[i])}
                            onMouseEnter={e => e.currentTarget.style.background = `rgba(${a.type === 'warning' ? '245,158,11' : '34,197,94'},0.15)`}
                            onMouseLeave={e => e.currentTarget.style.background = `rgba(${a.type === 'warning' ? '245,158,11' : '34,197,94'},0.08)`}
                        >
                            <a.icon size={16} color={a.color} style={{ flexShrink: 0 }} />
                            <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1 }}>{a.text}</span>
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Tap for details ›</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Hourly Temp Chart */}
            <div className="card" style={{ marginBottom: 24, cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => setModal({
                    title: "Today's Temperature Chart", icon: '🌡️', type: 'warning',
                    subtitle: 'Hourly forecast — March 10, 2026',
                    value: '32°C Peak', trend: 'At 3 PM',
                    description: 'This chart shows how temperature changes throughout today. Knowing temperature patterns helps you plan farm activities at the right time of day.',
                    points: [
                        'Coolest at 3 AM (18°C) — best time for cold-sensitive operations',
                        'Temperature peaks at 3 PM (32°C) — avoid heavy field work',
                        'Safe field work window: 6–10 AM and after 5 PM',
                        'Light rain expected after midnight — humidity will rise after 9 PM'
                    ],
                    tip: 'Schedule fertilizer/pesticide application before 10 AM for maximum efficiency and minimum evaporation loss.'
                })}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '' }}
            >
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Today's Temperature</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Hourly forecast for Mar 10, 2026 · Click for details</div>
                <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={hourlyData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                        <defs>
                            <linearGradient id="temp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} unit="°" />
                        <Tooltip contentStyle={{ background: '#1a2e1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                        <Area type="monotone" dataKey="temp" name="Temperature" stroke="#f59e0b" strokeWidth={2} fill="url(#temp)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* 7-Day Forecast */}
            <div className="card">
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>7-Day Forecast</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Daily forecast with farming advisories · Click any day for detailed advice</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {weekForecast.map((day, i) => (
                        <div key={i} style={{
                            display: 'grid', gridTemplateColumns: '120px 44px 1fr 80px 80px 1fr',
                            alignItems: 'center', gap: 16, padding: '14px 16px',
                            borderRadius: 10, cursor: 'pointer',
                            transition: 'background 0.15s ease',
                            borderBottom: i < weekForecast.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                        }}
                            onClick={() => setModal({
                                title: `${i === 0 ? 'Today' : day.day} — ${day.cond}`,
                                icon: day.cond.includes('Rain') || day.cond === 'Showers' ? '🌧️' : day.cond === 'Overcast' ? '☁️' : '☀️',
                                type: day.cond.includes('Rain') ? 'warning' : day.cond === 'Overcast' ? 'info' : 'success',
                                subtitle: day.date,
                                value: `${day.high}°C / ${day.low}°C`,
                                trend: parseInt(day.rain) > 50 ? `⚠️ ${day.rain} rain chance` : `${day.rain} rain chance`,
                                description: `${i === 0 ? 'Today' : day.day} (${day.date}): ${day.cond} conditions. Temperature ranging from ${day.low}°C at night to ${day.high}°C in the afternoon.`,
                                points: [
                                    `Temperature: High ${day.high}°C, Low ${day.low}°C`,
                                    `Humidity: ${day.humidity}% — ${day.humidity > 75 ? '⚠️ High fungal disease risk' : 'comfortable for crops'}`,
                                    `Wind: ${day.wind} — ${parseInt(day.wind) > 15 ? 'avoid spraying chemicals' : 'safe for spraying'}`,
                                    `Rain probability: ${day.rain} — ${parseInt(day.rain) > 50 ? 'delay fertilizer application' : 'safe to apply inputs'}`,
                                ],
                                tip: day.farm.replace('⚠️ ', ''),
                            })}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{i === 0 ? 'Today' : day.day}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{day.date}</div>
                            </div>
                            <day.icon size={22} color={day.cond.includes('Rain') || day.cond === 'Showers' ? '#93c5fd' : day.cond === 'Overcast' ? '#9ca3af' : '#fbbf24'} />
                            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{day.cond}</div>
                            <div style={{ display: 'flex', gap: 8, fontSize: 13 }}>
                                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{day.high}°</span>
                                <span style={{ color: 'var(--text-muted)' }}>{day.low}°</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#38bdf8' }}>
                                <Droplets size={12} /> {day.rain}
                            </div>
                            <div style={{
                                fontSize: 12, color: day.farm.includes('⚠️') ? '#f59e0b' : 'var(--text-muted)',
                                lineHeight: 1.4,
                            }}>
                                {day.farm}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
