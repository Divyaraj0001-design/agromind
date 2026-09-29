import { useState, useRef } from 'react'
import {
    TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
    Minus, Bell, Star, RefreshCcw, Filter
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'

const crops = [
    { name: 'Wheat', emoji: '🌾', price: 2275, change: +2.8, unit: '₹/quintal', high52: 2450, low52: 1980, volume: '2.4L quintals', trend: 'up', category: 'Cereal' },
    { name: 'Rice', emoji: '🌾', price: 3180, change: -1.2, unit: '₹/quintal', high52: 3450, low52: 2900, volume: '8.2L quintals', trend: 'down', category: 'Cereal' },
    { name: 'Tomato', emoji: '🍅', price: 2840, change: +18.4, unit: '₹/quintal', high52: 5200, low52: 800, volume: '1.1L quintals', trend: 'up', category: 'Vegetable' },
    { name: 'Onion', emoji: '🧅', price: 1650, change: -5.2, unit: '₹/quintal', high52: 4800, low52: 600, volume: '3.6L quintals', trend: 'down', category: 'Vegetable' },
    { name: 'Cotton', emoji: '🌸', price: 7200, change: +0.8, unit: '₹/quintal', high52: 7800, low52: 6400, volume: '0.8L quintals', trend: 'stable', category: 'Cash Crop' },
    { name: 'Soybean', emoji: '🫘', price: 4125, change: +3.5, unit: '₹/quintal', high52: 4600, low52: 3500, volume: '1.5L quintals', trend: 'up', category: 'Oilseed' },
]

const wheatHistory = [
    { date: 'Sep', price: 2100, predicted: 2080 },
    { date: 'Oct', price: 2150, predicted: 2140 },
    { date: 'Nov', price: 2200, predicted: 2180 },
    { date: 'Dec', price: 2180, predicted: 2200 },
    { date: 'Jan', price: 2220, predicted: 2230 },
    { date: 'Feb', price: 2260, predicted: 2250 },
    { date: 'Mar', price: 2275, predicted: 2280 },
    { date: 'Apr', price: null, predicted: 2320 },
    { date: 'May', price: null, predicted: 2380 },
    { date: 'Jun', price: null, predicted: 2410 },
]

const insights = [
    { emoji: '📈', title: 'Tomato prices spike +18%', desc: 'Unseasonal demand from southern states. Consider holding stock 2-3 weeks.', badge: 'High Opportunity', color: '#22c55e' },
    { emoji: '⚠️', title: 'Onion glut in Maharashtra', desc: 'Oversupply leading to price crash. Delay selling if you can store safely.', badge: 'Price Risk', color: '#ef4444' },
    { emoji: '🌾', title: 'Wheat MSP raised to ₹2,275', desc: 'Government procurement centers opening next week. Register your produce early.', badge: 'MSP Alert', color: '#fbbf24' },
    { emoji: '🌿', title: 'Soybean export demand rising', desc: 'Global shortfall expected. Prices may increase 8-12% in next 30 days.', badge: 'Export Demand', color: '#38bdf8' },
]

export default function MarketInsights() {
    const [selectedCrop, setSelectedCrop] = useState(crops[0])
    const [filter, setFilter] = useState('All')
    const [alertCrop, setAlertCrop] = useState(crops[0].name)
    const [alertCondition, setAlertCondition] = useState('Goes above')
    const [alertPrice, setAlertPrice] = useState('')
    const [alerts, setAlerts] = useState([])

    const filteredCrops = filter === 'All' ? crops : crops.filter(c => c.category === filter)

    const handleSetAlert = () => {
        if (!alertPrice || isNaN(alertPrice) || Number(alertPrice) <= 0) {
            toast.error('Please enter a valid target price!')
            return
        }
        const alertMsg = `Alert set: ${alertCrop} ${alertCondition.toLowerCase()} ₹${Number(alertPrice).toLocaleString('en-IN')}/quintal`
        setAlerts(prev => [...prev, alertMsg])
        toast.success(`🔔 ${alertMsg}`, { duration: 4000 })
        setAlertPrice('')
    }

    return (
        <div style={{ padding: 28 }} className="page-enter">
            {/* TOP ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 20, marginBottom: 24 }}>
                {[
                    { label: 'Wheat MSP', value: '₹2,275', sub: '↑ ₹150 from last year', color: '#fbbf24', icon: '🌾' },
                    { label: 'Best Performer', value: 'Tomato', sub: '+18.4% this week', color: '#22c55e', icon: '🍅' },
                    { label: 'Worst Performer', value: 'Onion', sub: '-5.2% this week', color: '#ef4444', icon: '🧅' },
                    { label: 'AI Forecast', value: 'Bullish', sub: 'Wheat & Soybean rising', color: '#38bdf8', icon: '🤖' },
                ].map((s, i) => (
                    <div key={i} className="stat-card" style={{ '--glow-color': s.color }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{s.label}</div>
                                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>{s.value}</div>
                                <div style={{ fontSize: 12, color: s.color, marginTop: 4 }}>{s.sub}</div>
                            </div>
                            <span style={{ fontSize: 28 }}>{s.icon}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* LEFT: Price Table */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Live Market Prices</div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Agmarknet data · Updated hourly</div>
                            </div>
                            <div style={{ display: 'flex', gap: 6 }}>
                                {['All', 'Cereal', 'Vegetable'].map(f => (
                                    <button key={f}
                                        onClick={() => setFilter(f)}
                                        style={{
                                            padding: '5px 12px', fontSize: 12, fontWeight: 500,
                                            background: filter === f ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)',
                                            border: `1px solid ${filter === f ? 'rgba(34,197,94,0.3)' : 'var(--border-subtle)'}`,
                                            color: filter === f ? '#4ade80' : 'var(--text-muted)',
                                            borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s',
                                        }}
                                    >{f}</button>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {filteredCrops.map((crop, i) => (
                                <div
                                    key={i}
                                    onClick={() => setSelectedCrop(crop)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 14px',
                                        borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s',
                                        background: selectedCrop.name === crop.name ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.01)',
                                        border: `1px solid ${selectedCrop.name === crop.name ? 'rgba(34,197,94,0.2)' : 'transparent'}`,
                                    }}
                                >
                                    <span style={{ fontSize: 22, flexShrink: 0 }}>{crop.emoji}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{crop.name}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{crop.category} · Vol: {crop.volume}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                                            {crop.price.toLocaleString('en-IN')}
                                        </div>
                                        <div style={{ fontSize: 11 }}>
                                            {crop.unit}
                                        </div>
                                    </div>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 3, fontSize: 13, fontWeight: 700,
                                        color: crop.change > 0 ? '#22c55e' : crop.change < 0 ? '#ef4444' : '#6b7280',
                                        minWidth: 60, justifyContent: 'flex-end',
                                    }}>
                                        {crop.change > 0 ? <ArrowUpRight size={14} /> : crop.change < 0 ? <ArrowDownRight size={14} /> : <Minus size={14} />}
                                        {Math.abs(crop.change)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Market Insights */}
                    <div className="card">
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>AI Market Intelligence</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Smart alerts and selling recommendations</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {insights.map((ins, i) => (
                                <div key={i} style={{
                                    padding: '12px 14px',
                                    background: 'rgba(255,255,255,0.02)',
                                    borderRadius: 10, border: '1px solid var(--border-subtle)',
                                    display: 'flex', gap: 12, alignItems: 'flex-start',
                                    cursor: 'pointer', transition: 'background 0.2s',
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                >
                                    <span style={{ fontSize: 20, flexShrink: 0 }}>{ins.emoji}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{ins.title}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{ins.desc}</div>
                                    </div>
                                    <span className={`badge`} style={{
                                        fontSize: 10, background: `${ins.color}18`, color: ins.color,
                                        border: `1px solid ${ins.color}30`, flexShrink: 0,
                                    }}>
                                        {ins.badge}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Chart */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Selected crop detail */}
                    <div className="card" style={{
                        background: 'linear-gradient(135deg, rgba(251,191,36,0.06), transparent)',
                        border: '1px solid rgba(251,191,36,0.15)',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <span style={{ fontSize: 24 }}>{selectedCrop.emoji}</span>
                                    <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                                        {selectedCrop.name}
                                    </span>
                                </div>
                                <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
                                    ₹{selectedCrop.price.toLocaleString('en-IN')}
                                    <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400, letterSpacing: 0, marginLeft: 6 }}>
                                        {selectedCrop.unit}
                                    </span>
                                </div>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 14, fontWeight: 700,
                                    color: selectedCrop.change >= 0 ? '#22c55e' : '#ef4444',
                                }}>
                                    {selectedCrop.change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                    {selectedCrop.change > 0 ? '+' : ''}{selectedCrop.change}% this week
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>52w High</div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: '#22c55e' }}>₹{selectedCrop.high52.toLocaleString('en-IN')}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>52w Low</div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: '#ef4444' }}>₹{selectedCrop.low52.toLocaleString('en-IN')}</div>
                            </div>
                        </div>

                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12 }}>
                            PRICE HISTORY & AI FORECAST
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={wheatHistory} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                                <defs>
                                    <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: '#1a2e1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                                <ReferenceLine x="Mar" stroke="rgba(255,255,255,0.2)" strokeDasharray="4 2" label={{ value: 'Today', fill: '#6b7280', fontSize: 10 }} />
                                <Area type="monotone" dataKey="price" name="Actual Price (₹)" stroke="#f59e0b" strokeWidth={2} fill="url(#priceGrad)" connectNulls={false} />
                                <Area type="monotone" dataKey="predicted" name="AI Predicted (₹)" stroke="#a78bfa" strokeWidth={2} strokeDasharray="6 3" fill="url(#predGrad)" />
                            </AreaChart>
                        </ResponsiveContainer>

                        <div style={{
                            marginTop: 16, padding: '12px 14px',
                            background: 'rgba(167,139,250,0.08)', borderRadius: 10,
                            border: '1px solid rgba(167,139,250,0.2)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#a78bfa', fontWeight: 600, marginBottom: 4 }}>
                                🤖 AI Price Prediction
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--gray-300)', lineHeight: 1.5 }}>
                                {selectedCrop.name} prices expected to rise to ₹{(selectedCrop.price * 1.06).toFixed(0)} by May-June 2026.
                                Consider storing 40-60% of your produce and selling gradually. Peak selling window: May 15-30.
                            </div>
                        </div>
                    </div>

                    {/* Set Price Alert */}
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                            <Bell size={18} color="#f59e0b" />
                            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Set Price Alert</div>
                        </div>
                        {alerts.length > 0 && (
                            <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {alerts.map((a, i) => (
                                    <div key={i} style={{ fontSize: 12, color: '#4ade80', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: '6px 10px' }}>
                                        🔔 {a}
                                    </div>
                                ))}
                            </div>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                            <div>
                                <label className="label">Crop</label>
                                <select className="select" value={alertCrop} onChange={e => setAlertCrop(e.target.value)}>
                                    {crops.map(c => <option key={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label">Alert when price</label>
                                <select className="select" value={alertCondition} onChange={e => setAlertCondition(e.target.value)}>
                                    <option>Goes above</option>
                                    <option>Goes below</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label className="label">Target Price (₹/quintal)</label>
                            <input className="input" type="number" placeholder="e.g., 2500" value={alertPrice} onChange={e => setAlertPrice(e.target.value)} />
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSetAlert}>
                            <Bell size={14} /> Set Alert
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
