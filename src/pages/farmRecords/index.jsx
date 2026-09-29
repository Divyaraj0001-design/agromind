import { useState } from 'react'
import {
    Plus, Trash2, Edit3, Download, Search,
    DollarSign, TrendingUp, ClipboardList, X, Check
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer
} from 'recharts'

const initialRecords = [
    { id: 1, crop: 'Wheat', field: 'Field A', area: 8, planted: '2025-11-15', harvest: '2026-03-20', status: 'Growing', fertilizer: 'NPK 20:20:0', cost: 42000, revenue: null, yield: null, emoji: '🌾' },
    { id: 2, crop: 'Rice', field: 'Field B', area: 12, planted: '2025-07-01', harvest: '2025-11-10', status: 'Harvested', fertilizer: 'Urea + DAP', cost: 58000, revenue: 96000, yield: 4.8, emoji: '🌾' },
    { id: 3, crop: 'Tomato', field: 'Field C', area: 3, planted: '2026-01-10', harvest: '2026-03-28', status: 'Fruiting', fertilizer: 'Calcium Nitrate', cost: 28000, revenue: null, yield: null, emoji: '🍅' },
    { id: 4, crop: 'Corn', field: 'Field D', area: 6, planted: '2025-06-15', harvest: '2025-10-20', status: 'Harvested', fertilizer: 'NPK 12:32:16', cost: 38000, revenue: 62000, yield: 5.2, emoji: '🌽' },
    { id: 5, crop: 'Mustard', field: 'Field A', area: 5, planted: '2025-10-25', harvest: '2026-02-15', status: 'Harvested', fertilizer: 'SSP + Urea', cost: 22000, revenue: 41000, yield: 2.1, emoji: '🌿' },
]

const cropEmojis = { wheat: '🌾', rice: '🌾', corn: '🌽', tomato: '🍅', cotton: '🌿', sugarcane: '🎋', soybean: '🫘', potato: '🥔', onion: '🧅', mustard: '🌿' }

const expensesData = [
    { category: 'Fertilizer', amount: 58000, color: '#22c55e' },
    { category: 'Seeds', amount: 32000, color: '#38bdf8' },
    { category: 'Irrigation', amount: 18000, color: '#a78bfa' },
    { category: 'Labor', amount: 75000, color: '#f59e0b' },
    { category: 'Pesticides', amount: 22000, color: '#fb923c' },
]

const monthlyData = [
    { month: 'Aug', revenue: 0, costs: 48000 },
    { month: 'Sep', revenue: 0, costs: 32000 },
    { month: 'Oct', revenue: 62000, costs: 18000 },
    { month: 'Nov', revenue: 96000, costs: 22000 },
    { month: 'Dec', revenue: 0, costs: 15000 },
    { month: 'Jan', revenue: 41000, costs: 28000 },
    { month: 'Feb', revenue: 0, costs: 12000 },
    { month: 'Mar', revenue: 0, costs: 38000 },
]

const defaultNewRecord = { crop: '', field: '', area: '', planted: '', harvest: '', fertilizer: '', cost: '', status: 'Growing' }

export default function FarmRecords() {
    const [records, setRecords] = useState(initialRecords)
    const [activeTab, setActiveTab] = useState('crops')
    const [search, setSearch] = useState('')
    const [showAdd, setShowAdd] = useState(false)
    const [newRecord, setNewRecord] = useState(defaultNewRecord)

    const filtered = records.filter(r =>
        r.crop.toLowerCase().includes(search.toLowerCase()) ||
        r.field.toLowerCase().includes(search.toLowerCase())
    )

    const totalRevenue = records.reduce((s, r) => s + (r.revenue || 0), 0)
    const totalCost = records.reduce((s, r) => s + (r.cost || 0), 0)
    const totalProfit = totalRevenue - totalCost
    const totalArea = records.reduce((s, r) => s + Number(r.area || 0), 0)

    // ✅ FIX 1: Actually adds the record to state
    const handleAdd = () => {
        if (!newRecord.crop.trim() || !newRecord.field.trim()) {
            toast.error('Crop name and field are required!')
            return
        }
        const emoji = cropEmojis[newRecord.crop.toLowerCase()] || '🌱'
        const record = {
            id: Date.now(),
            crop: newRecord.crop,
            field: newRecord.field,
            area: Number(newRecord.area) || 0,
            planted: newRecord.planted || '—',
            harvest: newRecord.harvest || '—',
            status: newRecord.status,
            fertilizer: newRecord.fertilizer || '—',
            cost: Number(newRecord.cost) || 0,
            revenue: null,
            yield: null,
            emoji,
        }
        setRecords(prev => [...prev, record])
        setShowAdd(false)
        setNewRecord(defaultNewRecord)
        toast.success(`✅ "${record.crop}" record added successfully!`)
    }

    const handleDelete = (id, cropName) => {
        setRecords(prev => prev.filter(r => r.id !== id))
        toast.error(`"${cropName}" record deleted`)
    }

    // ✅ FIX 2: Actually exports CSV
    const handleExportCSV = () => {
        const headers = ['Crop', 'Field', 'Area (ac)', 'Planted', 'Harvest', 'Status', 'Fertilizer', 'Cost (₹)', 'Revenue (₹)', 'Yield (t/ac)']
        const rows = records.map(r => [
            r.crop, r.field, r.area, r.planted, r.harvest,
            r.status, r.fertilizer, r.cost,
            r.revenue ?? '', r.yield ?? ''
        ])
        const csvContent = [headers, ...rows]
            .map(row => row.map(v => `"${v}"`).join(','))
            .join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `farm-records-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        toast.success('📥 CSV exported successfully!')
    }

    return (
        <div style={{ padding: 28 }} className="page-enter">
            {/* Stats */}
            <div className="grid-4" style={{ marginBottom: 24 }}>
                {[
                    { label: 'Total Farm Area', value: `${totalArea} acres`, color: '#22c55e', icon: '🌾' },
                    { label: 'Total Revenue', value: `₹${(totalRevenue / 1000).toFixed(0)}K`, color: '#22c55e', icon: '💰' },
                    { label: 'Total Expenses', value: `₹${(totalCost / 1000).toFixed(0)}K`, color: '#ef4444', icon: '📊' },
                    { label: 'Net Profit', value: `₹${(totalProfit / 1000).toFixed(0)}K`, color: totalProfit >= 0 ? '#22c55e' : '#ef4444', icon: '📈' },
                ].map((s, i) => (
                    <div key={i} className="stat-card" style={{ '--glow-color': s.color }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{s.label}</div>
                                <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1 }}>{s.value}</div>
                            </div>
                            <span style={{ fontSize: 28 }}>{s.icon}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
                {[
                    { id: 'crops', label: 'Crop Records', icon: ClipboardList },
                    { id: 'expenses', label: 'Expenses', icon: DollarSign },
                    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '8px 16px', borderRadius: 8,
                            fontSize: 13, fontWeight: 500, cursor: 'pointer',
                            background: activeTab === tab.id ? 'var(--bg-card)' : 'transparent',
                            color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
                            border: 'none', transition: 'all 0.2s',
                            boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none',
                        }}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* CROP RECORDS TAB */}
            {activeTab === 'crops' && (
                <div className="animate-fade-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div className="search-input" style={{ width: 280 }}>
                            <Search size={14} color="var(--text-muted)" />
                            <input
                                placeholder="Search crops or fields..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-ghost btn-sm" onClick={handleExportCSV}>
                                <Download size={14} /> Export CSV
                            </button>
                            <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(v => !v)}>
                                {showAdd ? <X size={14} /> : <Plus size={14} />}
                                {showAdd ? 'Cancel' : 'Add Record'}
                            </button>
                        </div>
                    </div>

                    {/* Add Record Form */}
                    {showAdd && (
                        <div className="card animate-fade-in" style={{ marginBottom: 20, border: '1px solid rgba(34,197,94,0.25)', background: 'rgba(34,197,94,0.03)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                                    ➕ Add New Crop Record
                                </div>
                                <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                                    <X size={16} />
                                </button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                                {[
                                    { label: 'Crop Name *', key: 'crop', type: 'text', placeholder: 'e.g., Wheat' },
                                    { label: 'Field *', key: 'field', type: 'text', placeholder: 'e.g., Field A' },
                                    { label: 'Area (acres)', key: 'area', type: 'number', placeholder: '0' },
                                    { label: 'Cost (₹)', key: 'cost', type: 'number', placeholder: '0' },
                                    { label: 'Planted Date', key: 'planted', type: 'date', placeholder: '' },
                                    { label: 'Harvest Date', key: 'harvest', type: 'date', placeholder: '' },
                                    { label: 'Fertilizer Used', key: 'fertilizer', type: 'text', placeholder: 'e.g., NPK' },
                                ].map(f => (
                                    <div key={f.key}>
                                        <label className="label">{f.label}</label>
                                        <input
                                            className="input"
                                            type={f.type}
                                            placeholder={f.placeholder}
                                            value={newRecord[f.key]}
                                            onChange={e => setNewRecord({ ...newRecord, [f.key]: e.target.value })}
                                        />
                                    </div>
                                ))}
                                <div>
                                    <label className="label">Status</label>
                                    <select className="select" value={newRecord.status} onChange={e => setNewRecord({ ...newRecord, status: e.target.value })}>
                                        <option>Growing</option>
                                        <option>Fruiting</option>
                                        <option>Harvested</option>
                                        <option>Failed</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={handleAdd}
                                    style={{ paddingLeft: 20, paddingRight: 20 }}
                                >
                                    <Check size={14} /> Save Record
                                </button>
                                <button className="btn btn-ghost btn-sm" onClick={() => setShowAdd(false)}>Cancel</button>
                            </div>
                        </div>
                    )}

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Crop</th>
                                    <th>Field</th>
                                    <th>Area</th>
                                    <th>Planted</th>
                                    <th>Harvest</th>
                                    <th>Status</th>
                                    <th>Cost</th>
                                    <th>Revenue</th>
                                    <th>Yield</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px 0' }}>
                                            No records found. Click "+ Add Record" to get started!
                                        </td>
                                    </tr>
                                ) : filtered.map(r => (
                                    <tr key={r.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span>{r.emoji}</span>
                                                <span style={{ fontWeight: 600 }}>{r.crop}</span>
                                            </div>
                                        </td>
                                        <td style={{ color: 'var(--text-muted)' }}>{r.field}</td>
                                        <td>{r.area} ac</td>
                                        <td style={{ color: 'var(--text-muted)' }}>{r.planted}</td>
                                        <td style={{ color: 'var(--text-muted)' }}>{r.harvest}</td>
                                        <td>
                                            <span className={`badge ${r.status === 'Harvested' ? 'badge-green' : r.status === 'Growing' ? 'badge-blue' : r.status === 'Failed' ? 'badge-red' : 'badge-amber'}`}
                                                style={{ fontSize: 11 }}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td style={{ color: '#f87171' }}>₹{Number(r.cost).toLocaleString('en-IN')}</td>
                                        <td style={{ color: '#4ade80' }}>
                                            {r.revenue ? `₹${r.revenue.toLocaleString('en-IN')}` : '—'}
                                        </td>
                                        <td>{r.yield ? `${r.yield} t/ac` : '—'}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button
                                                    style={{ padding: 6, borderRadius: 6, background: 'rgba(255,255,255,0.06)', cursor: 'pointer', border: 'none', color: 'var(--gray-400)', display: 'flex', alignItems: 'center' }}
                                                    onClick={() => toast('Edit coming soon!', { icon: '✏️' })}
                                                >
                                                    <Edit3 size={13} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(r.id, r.crop)}
                                                    style={{ padding: 6, borderRadius: 6, background: 'rgba(239,68,68,0.08)', cursor: 'pointer', border: 'none', color: '#f87171', display: 'flex', alignItems: 'center' }}
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>
                        {filtered.length} record{filtered.length !== 1 ? 's' : ''} · {records.length} total
                    </div>
                </div>
            )}

            {/* EXPENSES TAB */}
            {activeTab === 'expenses' && (
                <div className="animate-fade-in">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        <div className="card">
                            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Expense Breakdown</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>This crop season</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {expensesData.map((e, i) => {
                                    const pct = Math.round((e.amount / totalCost) * 100)
                                    return (
                                        <div key={i}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{e.category}</span>
                                                <div style={{ display: 'flex', gap: 12 }}>
                                                    <span style={{ fontSize: 13, fontWeight: 700, color: e.color }}>₹{e.amount.toLocaleString('en-IN')}</span>
                                                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pct}%</span>
                                                </div>
                                            </div>
                                            <div className="progress-bar">
                                                <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg,${e.color},${e.color}99)` }} />
                                            </div>
                                        </div>
                                    )
                                })}
                                <div style={{ marginTop: 8, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Total Expenses</span>
                                        <span style={{ fontSize: 16, fontWeight: 800, color: '#f87171' }}>₹{totalCost.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Add Expense</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Record a new farm expense</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div>
                                    <label className="label">Category</label>
                                    <select className="select">
                                        {expensesData.map(e => <option key={e.category}>{e.category}</option>)}
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Amount (₹)</label>
                                    <input className="input" type="number" placeholder="Enter amount" />
                                </div>
                                <div>
                                    <label className="label">Date</label>
                                    <input className="input" type="date" defaultValue="2026-03-10" />
                                </div>
                                <div>
                                    <label className="label">Notes</label>
                                    <input className="input" placeholder="What was this expense for?" />
                                </div>
                                <button className="btn btn-primary" style={{ justifyContent: 'center' }}
                                    onClick={() => toast.success('Expense recorded!')}>
                                    <Plus size={14} /> Record Expense
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ANALYTICS TAB */}
            {activeTab === 'analytics' && (
                <div className="animate-fade-in">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        <div className="card">
                            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Revenue vs Costs</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Monthly comparison (₹)</div>
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={monthlyData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ background: '#1a2e1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                                    <Bar dataKey="revenue" name="Revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="costs" name="Costs" fill="#ef444460" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="card">
                            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Profit/Loss Summary</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Per crop analysis</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {records.filter(r => r.revenue).map((r, i) => {
                                    const profit = r.revenue - r.cost
                                    const margin = Math.round((profit / r.revenue) * 100)
                                    return (
                                        <div key={i} style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span style={{ fontSize: 16 }}>{r.emoji}</span>
                                                    <div>
                                                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{r.crop} — {r.field}</div>
                                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.area} acres · {r.yield} t/ac</div>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: 15, fontWeight: 800, color: profit >= 0 ? '#22c55e' : '#ef4444' }}>
                                                        {profit >= 0 ? '+' : ''}₹{profit.toLocaleString('en-IN')}
                                                    </div>
                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{margin}% margin</div>
                                                </div>
                                            </div>
                                            <div className="progress-bar">
                                                <div className="progress-fill" style={{
                                                    width: `${Math.min(margin, 100)}%`,
                                                    background: margin > 40 ? 'linear-gradient(90deg,#22c55e,#4ade80)' : margin > 20 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : 'linear-gradient(90deg,#ef4444,#f87171)',
                                                }} />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
