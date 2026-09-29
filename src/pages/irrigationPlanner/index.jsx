import { useState } from 'react'
import {
    Droplets, Zap, Loader, Calendar, Clock, AlertTriangle,
    CheckCircle, TrendingDown, Info, Settings
} from 'lucide-react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell
} from 'recharts'
import InfoModal from '../../components/modals/InfoModal'

const weekData = [
    { day: 'Mon', used: 1240, optimal: 1400, saved: 160 },
    { day: 'Tue', used: 980, optimal: 1200, saved: 220 },
    { day: 'Wed', used: 1650, optimal: 1500, saved: -150 },
    { day: 'Thu', used: 1100, optimal: 1300, saved: 200 },
    { day: 'Fri', used: 890, optimal: 1100, saved: 210 },
    { day: 'Sat', used: 1320, optimal: 1400, saved: 80 },
    { day: 'Sun', used: 1050, optimal: 1200, saved: 150 },
]

const fields = [
    { name: 'Field A — Wheat', moisture: 68, status: 'Good', action: 'No irrigation needed', nextIrr: '2 days', icon: '🌾', color: '#22c55e' },
    { name: 'Field B — Rice', moisture: 35, status: 'Low', action: 'Irrigate within 6 hours', nextIrr: 'Now', icon: '🌱', color: '#ef4444' },
    { name: 'Field C — Tomato', moisture: 52, status: 'Moderate', action: 'Irrigate tomorrow morning', nextIrr: '18 hours', icon: '🍅', color: '#f59e0b' },
    { name: 'Field D — Corn', moisture: 74, status: 'Good', action: 'No irrigation needed', nextIrr: '3 days', icon: '🌽', color: '#22c55e' },
]

const schedule = [
    { time: '06:00 AM', field: 'Field B — Rice', duration: '45 min', volume: '1,800L', status: 'Scheduled', priority: 'Critical' },
    { time: '08:30 AM', field: 'Field C — Tomato', duration: '30 min', volume: '900L', status: 'Pending', priority: 'High' },
    { time: '04:00 PM', field: 'Field A — Wheat', duration: '20 min', volume: '600L', status: 'Optional', priority: 'Low' },
]

const statInfoMap = [
    {
        title: 'Water Used Today', icon: '💧', type: 'info', value: '8,230L', trend: '↓ 18% below plan',
        description: 'Total water consumed across all 4 fields today through both drip and flood irrigation systems.',
        points: ['Field B (Rice): 3,200L — highest (flood irrigation)', 'Field A (Wheat): 2,100L — drip system, efficient', 'Field C (Tomato): 1,800L — drip + sprinkler combo', 'Field D (Corn): 1,130L — minimal need today'],
        tip: 'Switching Field B to AWD (Alternate Wetting and Drying) method for rice can reduce water use by 25-30%.'
    },
    {
        title: 'Water Saved This Month', icon: '💰', type: 'success', value: '28,400L', trend: '↑ Rs.4,200 cost saving',
        description: 'Cumulative water saved this month vs last months manual irrigation volume. AI scheduling has optimized watering timing and volume.',
        points: ['Manual irrigation average: ~58,000L/month', 'AI-optimized: ~29,600L/month — 48% reduction', 'Savings driven by weather-aware scheduling', 'Rain forecast integration saved ~8,000L this week alone'],
        tip: 'You saved enough water to fill 14 overhead tanks (2,000L each). A great achievement for sustainable farming!'
    },
    {
        title: 'Fields Needing Water', icon: '⚠️', type: 'danger', value: '1 Field', trend: '↓ Critical — Field B',
        description: 'AI has detected 1 field (Field B — Rice) with critically low soil moisture that requires immediate irrigation.',
        points: ['Field B moisture: 35% (critical threshold is < 40%)', 'Rice in tillering stage needs moist-to-flooded conditions', 'Delay > 6 hours risks tiller death and yield loss', 'AI has auto-scheduled irrigation at 6:00 AM tomorrow'],
        tip: 'Tap "Generate AI Schedule" to see the auto-created irrigation plan for Field B. Or irrigate manually right now.'
    },
    {
        title: 'Irrigation Efficiency Score', icon: '⚡', type: 'purple', value: '87%', trend: '↑ 12% vs manual',
        description: 'This AI-calculated score measures how efficiently you are using water compared to the theoretical optimal for your crop, soil and climate conditions.',
        points: ['87% = very good (industry average: 60-70%)', 'Score based on: timing, volume accuracy, and crop need matching', 'Lost 13% mainly from Field B over-irrigation on Wednesday', 'AI drip scheduling = 25% better than flood irrigation'],
        tip: 'Achieve 90%+ by switching to drip irrigation for Field B rice using the AWD method.'
    },
]

const fieldInfoMap = [
    {
        title: 'Field A — Wheat Soil Moisture', icon: '🌾', type: 'success', value: '68%', trend: '✓ Optimal',
        description: 'Field A has excellent soil moisture at 68% — right in the optimal range for wheat in the flowering stage (60-75%).',
        points: ['68% moisture = no irrigation needed for 2 more days', 'Wheat flowering needs moderate moisture, not wet soil', 'Drip irrigation system is working efficiently here', 'Next recommended irrigation: in 2 days, ~600L'],
        tip: 'During wheat flowering, avoid sprinkler irrigation. Drip-only prevents waterlogging of pollen and reduces blight risk.'
    },
    {
        title: 'Field B — Rice Soil Moisture', icon: '🌱', type: 'danger', value: '35%', trend: '↓ CRITICAL',
        description: 'URGENT: Field B (Rice) soil moisture has dropped to 35% — well below the 50%+ requirement for rice in the tillering stage.',
        points: ['35% moisture = Critical (rice needs 60%+ or flooded soil)', 'Tillering stage: water stress kills tillers permanently', 'Each dead tiller = fewer panicles = lower grain yield', 'AI recommends immediate 45-min flood irrigation (1,800L)'],
        tip: 'Irrigate Field B immediately! Open the main valve for 45 minutes or use the auto-schedule. This is time-sensitive.'
    },
    {
        title: 'Field C — Tomato Soil Moisture', icon: '🍅', type: 'warning', value: '52%', trend: '~ Borderline',
        description: 'Field C (Tomato) is at 52% moisture — borderline for tomatoes in fruiting stage which need 55-70% consistently.',
        points: ['52% is slightly below ideal (target: 55-70%)', 'Tomatoes in fruiting stage need consistent moisture', 'Fluctuating moisture causes blossom end rot in tomatoes', 'Action: irrigate tomorrow morning for 30 minutes'],
        tip: 'Use mulch around tomato plants to reduce evaporation and stabilize soil moisture between irrigation events.'
    },
    {
        title: 'Field D — Corn Soil Moisture', icon: '🌽', type: 'success', value: '74%', trend: '✓ Excellent',
        description: 'Field D (Corn) has excellent soil moisture at 74% — well within the optimal range for corn at tasseling stage (65-80%).',
        points: ['74% moisture = no irrigation needed for 3 more days', 'Corn tasseling: adequate moisture ensures good pollen shed', 'Drip irrigation system maintaining levels perfectly', 'Next check scheduled: day after tomorrow'],
        tip: 'During corn tasseling, maintain 65-80% soil moisture. Too wet (>85%) can cause anaerobic root conditions.'
    },
]

const aiInputInfo = [
    {
        title: 'Weather Forecast Integration', icon: '🌧️', type: 'info', value: 'Rain: Wed +52mm',
        description: 'The AI checks the 7-day weather forecast before generating irrigation schedules to avoid watering before rain events.',
        points: ['Heavy rain expected Wednesday (52mm)', 'AI will skip Thursday-Friday irrigation since rain will do it', 'Saves approximately 4,800L of irrigation water', 'Rain data sourced from IMD (India Met Dept) API'],
        tip: 'AI automatically adjusts schedules when rain > 10mm is expected. No manual intervention needed.'
    },
    {
        title: 'Evapotranspiration Rate', icon: '☀️', type: 'warning', value: '4.8 mm/day',
        description: 'Evapotranspiration (ET) measures how much water crops lose to the atmosphere through evaporation plus transpiration. Higher ET = more irrigation needed.',
        points: ['4.8mm/day is moderate-high (hot, sunny conditions)', 'This means crops lose ~48,000L water/hectare/day', 'AI calculates ET using temperature, humidity, wind, and radiation', 'Higher ET in summer = increase irrigation frequency'],
        tip: 'On high ET days (> 6mm), move irrigation to early morning (before 7 AM) to minimize evaporation loss.'
    },
    {
        title: 'Crop Water Requirement', icon: '🌾', type: 'info', value: '28mm/week avg',
        description: 'Each crop has different water requirements. This shows the average water need across all your crops for the current growth stage.',
        points: ['Rice (Field B): 40mm/week — highest need (flooding method)', 'Tomato (Field C): 28mm/week — fruiting stage peak demand', 'Wheat (Field A): 22mm/week — moderate during flowering', 'Corn (Field D): 25mm/week — normal during tasseling'],
        tip: 'Use the Crop Advisor to get stage-specific water requirements for each crop and adjust accordingly.'
    },
    {
        title: 'Soil Water Deficit', icon: '🌍', type: 'warning', value: '22mm to refill',
        description: 'Soil water deficit is the amount of water your fields are currently short of compared to their ideal moisture capacity.',
        points: ['22mm deficit = fields are 22mm below field capacity', 'Field B (Rice) has highest deficit: 35mm', 'Field A and D are near zero deficit (well irrigated)', 'To fill deficit: approximately 5,500L of water needed across all fields'],
        tip: 'Click "Generate AI Schedule" below to automatically calculate the exact irrigation needed to fill the soil deficit efficiently.'
    },
]

const CustomBar = ({ x, y, width, height, value, optimal }) => {
    const isOver = value > optimal
    return (
        <rect x={x} y={y} width={width} height={height}
            fill={isOver ? '#ef4444' : '#38bdf8'}
            rx={4} opacity={0.85}
        />
    )
}

export default function IrrigationPlanner() {
    const [planning, setPlanning] = useState(false)
    const [planned, setPlanned] = useState(false)
    const [modal, setModal] = useState(null)

    const handlePlan = async () => {
        setPlanning(true)
        await new Promise(r => setTimeout(r, 1800))
        setPlanning(false)
        setPlanned(true)
    }

    return (
        <div style={{ padding: 28 }} className="page-enter">
            {modal && <InfoModal data={modal} onClose={() => setModal(null)} />}

            {/* HEADER STATS */}
            <div className="grid-4" style={{ marginBottom: 24 }}>
                {[
                    { label: 'Water Used Today', value: '8,230L', sub: '↓ 18% below plan', color: '#38bdf8', icon: Droplets },
                    { label: 'Water Saved (Month)', value: '28,400L', sub: '≈ ₹4,200 saved', color: '#22c55e', icon: TrendingDown },
                    { label: 'Fields Needing Water', value: '1 field', sub: 'Field B is critical', color: '#ef4444', icon: AlertTriangle },
                    { label: 'Efficiency Score', value: '87%', sub: '↑ 12% vs manual', color: '#a78bfa', icon: Zap },
                ].map((s, i) => (
                    <div key={i} className="stat-card" style={{ '--glow-color': s.color, cursor: 'pointer', transition: 'all 0.2s' }}
                        onClick={() => setModal(statInfoMap[i])}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)' }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 8 }}>{s.label}</div>
                                <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>{s.value}</div>
                                <div style={{ fontSize: 12, color: s.color, marginTop: 4 }}>{s.sub}</div>
                            </div>
                            <div style={{ width: 40, height: 40, background: `${s.color}18`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <s.icon size={18} color={s.color} />
                            </div>
                        </div>
                        <div style={{ marginTop: 8, fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>ℹ Click for details</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* LEFT */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Field Moisture Status */}
                    <div className="card">
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                            Real-time Soil Moisture
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                            IoT sensor readings · Click any field for details
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {fields.map((f, i) => (
                                <div key={i} style={{
                                    padding: '14px 16px',
                                    background: 'rgba(255,255,255,0.02)',
                                    borderRadius: 12, border: '1px solid var(--border-subtle)',
                                    borderLeft: `3px solid ${f.color}`,
                                    cursor: 'pointer', transition: 'all 0.15s',
                                }}
                                    onClick={() => setModal(fieldInfoMap[i])}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: 18 }}>{f.icon}</span>
                                            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{f.name}</span>
                                        </div>
                                        <span className={`badge ${f.color === '#22c55e' ? 'badge-green' : f.color === '#ef4444' ? 'badge-red' : 'badge-amber'}`}
                                            style={{ fontSize: 11 }}>
                                            {f.status}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                        <div className="progress-bar" style={{ flex: 1 }}>
                                            <div className="progress-fill" style={{
                                                width: `${f.moisture}%`,
                                                background: f.color === '#22c55e' ? 'linear-gradient(90deg,#22c55e,#4ade80)' :
                                                    f.color === '#ef4444' ? 'linear-gradient(90deg,#ef4444,#f87171)' :
                                                        'linear-gradient(90deg,#f59e0b,#fbbf24)',
                                            }} />
                                        </div>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: f.color, flexShrink: 0 }}>{f.moisture}%</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{f.action}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                                            <Clock size={11} /> Next: {f.nextIrr}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Planner */}
                    <div className="card" style={{
                        background: 'linear-gradient(135deg, rgba(56,189,248,0.06), rgba(56,189,248,0.02))',
                        border: '1px solid rgba(56,189,248,0.2)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <div style={{ width: 40, height: 40, background: 'rgba(56,189,248,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Zap size={18} color="#38bdf8" />
                            </div>
                            <div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>AI Irrigation Optimizer</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Generate optimal schedule using weather + soil data</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                            {[
                                { label: 'Weather Forecast', value: 'Rain: Wed (+52mm)', icon: '🌧️' },
                                { label: 'Evapotranspiration', value: '4.8 mm/day', icon: '☀️' },
                                { label: 'Crop Water Need', value: '28mm/week avg', icon: '🌾' },
                                { label: 'Soil Deficit', value: '22mm to refill', icon: '🌍' },
                            ].map((item, i) => (
                                <div key={i} style={{
                                    padding: '10px 12px',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: 8, border: '1px solid var(--border-subtle)',
                                    cursor: 'pointer', transition: 'all 0.15s',
                                }}
                                    onClick={() => setModal(aiInputInfo[i])}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                >
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                                        {item.label}
                                        <span style={{ fontSize: 10, opacity: 0.5 }}>ⓘ</span>
                                    </div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                                        {item.icon} {item.value}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', justifyContent: 'center', height: 44 }}
                            onClick={handlePlan}
                            disabled={planning}
                        >
                            {planning ? (
                                <><Loader size={16} className="animate-spin" /> Optimizing Schedule...</>
                            ) : (
                                <><Zap size={16} /> {planned ? 'Regenerate AI Schedule' : 'Generate AI Schedule'}</>
                            )}
                        </button>
                    </div>
                </div>

                {/* RIGHT */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Water Usage Chart */}
                    <div className="card" style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                        onClick={() => setModal({
                            title: 'Weekly Water Usage Chart', icon: '📊', type: 'info',
                            subtitle: 'Actual vs Optimal per day (Litres)',
                            value: '8,230L avg/day', trend: '↓ 14% under optimal',
                            description: 'This bar chart compares your actual daily water usage (blue bars) against the AI-calculated optimal (outline bars). Being under optimal means efficient use.',
                            points: [
                                'Blue bars: actual water used each day',
                                'Outline bars: what AI calculated as ideal usage',
                                'Wednesday: used 1,650L vs optimal 1,500L — overwatered by 150L',
                                'Friday: used only 890L — excellent efficiency day'
                            ],
                            tip: 'Aim to keep blue bars at or below the outline level. Enable AI auto-schedule to automatically maintain optimal usage.'
                        })}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
                    >
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Weekly Water Usage</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Actual vs optimal (litres) · Click for details</div>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={weekData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ background: '#1a2e1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                                    labelStyle={{ color: '#6b7280', fontSize: 12 }}
                                    itemStyle={{ fontSize: 13 }}
                                />
                                <Bar dataKey="used" name="Used (L)" fill="#38bdf8" radius={[4, 4, 0, 0]} opacity={0.85} />
                                <Bar dataKey="optimal" name="Optimal (L)" fill="rgba(56,189,248,0.25)" radius={[4, 4, 0, 0]} stroke="#38bdf8" strokeWidth={1} strokeDasharray="4 2" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Today's Schedule */}
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Today's Irrigation Schedule</div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Mar 10, 2026 · AI Optimized</div>
                            </div>
                            {planned && <span className="badge badge-blue"><Zap size={11} /> AI Generated</span>}
                        </div>

                        {!planned && (
                            <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: 32, marginBottom: 12 }}>⏱️</div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>No AI schedule yet</div>
                                <div style={{ fontSize: 13, marginTop: 4 }}>Click "Generate AI Schedule" to create an optimized irrigation plan</div>
                            </div>
                        )}

                        {planned && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} className="animate-fade-in">
                                {schedule.map((s, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px',
                                        background: 'rgba(255,255,255,0.02)', borderRadius: 10,
                                        border: '1px solid var(--border-subtle)',
                                        borderLeft: `3px solid ${s.priority === 'Critical' ? '#ef4444' : s.priority === 'High' ? '#f59e0b' : '#6b7280'}`,
                                        cursor: 'pointer', transition: 'background 0.15s',
                                    }}
                                        onClick={() => setModal({
                                            title: `Schedule: ${s.field}`, icon: '⏰', type: s.priority === 'Critical' ? 'danger' : s.priority === 'High' ? 'warning' : 'success',
                                            value: s.time, trend: `${s.priority} priority`,
                                            description: `This irrigation slot will water ${s.field} for ${s.duration}, using ${s.volume} of water. Priority: ${s.priority}.`,
                                            points: [
                                                `Scheduled time: ${s.time}`,
                                                `Duration: ${s.duration}`,
                                                `Water volume: ${s.volume}`,
                                                `Priority level: ${s.priority} — ${s.priority === 'Critical' ? 'Irrigate exactly on time' : s.priority === 'High' ? 'Try not to delay beyond 2 hours' : 'Can be skipped if inconvenient'}`
                                            ],
                                            tip: s.priority === 'Critical' ? 'Do not skip or delay this irrigation — crop yield is at risk.' : 'You can shift this schedule by 1-2 hours if needed without significant impact.'
                                        })}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                    >
                                        <div style={{ textAlign: 'center', flexShrink: 0 }}>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{s.time.split(' ')[0]}</div>
                                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.time.split(' ')[1]}</div>
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {s.field}
                                            </div>
                                            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                                <span><Clock size={11} /> {s.duration}</span>
                                                <span><Droplets size={11} /> {s.volume}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className={`badge ${s.priority === 'Critical' ? 'badge-red' : s.priority === 'High' ? 'badge-amber' : 'badge-green'}`}
                                                style={{ fontSize: 11 }}>
                                                {s.priority}
                                            </span>
                                        </div>
                                    </div>
                                ))}

                                <div className="alert alert-info" style={{ marginTop: 4 }}>
                                    <Info size={14} style={{ flexShrink: 0 }} />
                                    <div style={{ fontSize: 12, lineHeight: 1.5 }}>
                                        <strong>AI Note:</strong> Rain forecast on Wednesday (52mm) will reduce irrigation needs Thu-Fri. AI has automatically adjusted the schedule.
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Savings Summary */}
                    <div className="card" style={{
                        background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.02))',
                        border: '1px solid rgba(34,197,94,0.2)',
                        cursor: 'pointer', transition: 'all 0.2s',
                    }}
                        onClick={() => setModal({
                            title: 'Water Savings Summary', icon: '💰', type: 'success',
                            value: 'Rs.4,200 saved', trend: '↑ This month',
                            description: 'AgroMind AI irrigation optimization has saved significant water and money compared to traditional manual irrigation methods.',
                            points: [
                                'Week savings: 12,400L = 6 full tanker trucks',
                                'Month savings: 28,400L = enough for 140 people per day',
                                'Cost saved: Rs.4,200/month (at Rs.15 per 100L pump cost)',
                                'Environmental benefit: reduced groundwater depletion by 48%'
                            ],
                            tip: 'Share your savings stats to inspire other farmers in your region to adopt smart irrigation practices.'
                        })}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
                    >
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
                            💧 Water Savings Summary · Click for details
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                            {[
                                { label: 'This Week', value: '12,400L', sub: 'saved', color: '#22c55e' },
                                { label: 'This Month', value: '28,400L', sub: 'saved', color: '#22c55e' },
                                { label: 'Cost Saved', value: '₹4,200', sub: 'this month', color: '#fbbf24' },
                            ].map((item, i) => (
                                <div key={i} style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 20, fontWeight: 800, color: item.color, letterSpacing: '-0.04em' }}>{item.value}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.label} {item.sub}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
