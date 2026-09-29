import { useState } from 'react'
import {
    Users, Database, Cpu, BarChart3, Shield, Bell,
    Search, Plus, Edit3, Trash2, ChevronDown,
    TrendingUp, AlertTriangle, CheckCircle, Clock, Settings,
    UserCheck, RefreshCcw, Eye, Download
} from 'lucide-react'
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import toast from 'react-hot-toast'

const users = [
    { id: 1, name: 'Rajan Kumar', email: 'rajan@farm.in', role: 'Farmer', location: 'Punjab', status: 'Active', crops: 4, joined: '2024-08-12', avatar: '#22c55e' },
    { id: 2, name: 'Sunita Patel', email: 'sunita@farm.in', role: 'Farmer', location: 'Gujarat', status: 'Active', crops: 2, joined: '2024-09-01', avatar: '#38bdf8' },
    { id: 3, name: 'Dr. Ramesh Rao', email: 'ramesh@agri.gov', role: 'Expert', location: 'Karnataka', status: 'Active', crops: 0, joined: '2024-07-20', avatar: '#a78bfa' },
    { id: 4, name: 'Harpreet Singh', email: 'harry@farm.in', role: 'Farmer', location: 'Haryana', status: 'Inactive', crops: 6, joined: '2024-10-05', avatar: '#f59e0b' },
    { id: 5, name: 'Admin User', email: 'admin@agromind.ai', role: 'Admin', location: 'Delhi', status: 'Active', crops: 0, joined: '2024-06-01', avatar: '#ef4444' },
]

const platformData = [
    { month: 'Sep', users: 1200, analyses: 3400, scans: 890 },
    { month: 'Oct', users: 2100, analyses: 5600, scans: 1430 },
    { month: 'Nov', users: 3400, analyses: 8900, scans: 2100 },
    { month: 'Dec', users: 4200, analyses: 11200, scans: 2800 },
    { month: 'Jan', users: 7800, analyses: 16800, scans: 4200 },
    { month: 'Feb', users: 10400, analyses: 24000, scans: 6100 },
    { month: 'Mar', users: 12400, analyses: 31200, scans: 7800 },
]

const aiModels = [
    { name: 'Crop Recommendation Model', version: 'v3.2.1', accuracy: 94.2, lastTrained: '2026-03-01', status: 'Active', requests: '284K/day', color: '#22c55e' },
    { name: 'Disease Detection CNN', version: 'v2.0.4', accuracy: 98.2, lastTrained: '2026-03-05', status: 'Active', requests: '42K/day', color: '#f59e0b' },
    { name: 'Irrigation Optimizer', version: 'v1.8.0', accuracy: 91.7, lastTrained: '2026-02-20', status: 'Active', requests: '158K/day', color: '#38bdf8' },
    { name: 'Market Price Predictor', version: 'v2.1.3', accuracy: 82.4, lastTrained: '2026-03-08', status: 'Training', requests: '96K/day', color: '#a78bfa' },
    { name: 'Weather Intelligence ML', version: 'v4.0.1', accuracy: 96.1, lastTrained: '2026-03-09', status: 'Active', requests: '512K/day', color: '#fb923c' },
]

const systemAlerts = [
    { type: 'error', text: 'Market Price Predictor undergoing retraining — temporary lower accuracy', time: '2h ago' },
    { type: 'warning', text: 'High API load detected on Disease Detection — scaling up', time: '4h ago' },
    { type: 'success', text: 'Weather Intelligence Model v4.0.1 deployed successfully', time: '1d ago' },
    { type: 'info', text: 'Monthly user growth: +19.2% (12,400 total farmers)', time: '1d ago' },
]

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState('overview')
    const [userSearch, setUserSearch] = useState('')
    const [userList, setUserList] = useState(users)

    const filteredUsers = userList.filter(u =>
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.role.toLowerCase().includes(userSearch.toLowerCase())
    )

    const handleExportUsers = () => {
        const headers = ['Name', 'Email', 'Role', 'Location', 'Active Crops', 'Joined', 'Status']
        const rows = userList.map(u => [u.name, u.email, u.role, u.location, u.crops, u.joined, u.status])
        const csvContent = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `users-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success('📥 Users exported to CSV!')
    }

    const handleToggleStatus = (id) => {
        setUserList(prev => prev.map(u => {
            if (u.id !== id) return u
            const newStatus = u.status === 'Active' ? 'Inactive' : 'Active'
            toast.success(`${u.name} marked as ${newStatus}`)
            return { ...u, status: newStatus }
        }))
    }

    return (
        <div style={{ padding: 28 }} className="page-enter">
            {/* Top Stats */}
            <div className="grid-4" style={{ marginBottom: 24 }}>
                {[
                    { label: 'Total Users', value: '12,400', sub: '+19.2% this month', color: '#22c55e', icon: Users },
                    { label: 'AI Analyses Run', value: '31.2K', sub: 'This month', color: '#38bdf8', icon: Cpu },
                    { label: 'Disease Scans', value: '7,800', sub: '98.2% accuracy', color: '#f59e0b', icon: Shield },
                    { label: 'Platform Uptime', value: '99.97%', sub: '0 downtime events', color: '#a78bfa', icon: CheckCircle },
                ].map((s, i) => (
                    <div key={i} className="stat-card" style={{ '--glow-color': s.color }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{s.label}</div>
                                <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>{s.value}</div>
                                <div style={{ fontSize: 12, color: s.color, marginTop: 4 }}>{s.sub}</div>
                            </div>
                            <div style={{ width: 40, height: 40, background: `${s.color}18`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <s.icon size={18} color={s.color} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
                {[
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'users', label: 'Users', icon: Users },
                    { id: 'models', label: 'AI Models', icon: Cpu },
                    { id: 'alerts', label: 'System Alerts', icon: Bell },
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '8px 16px', borderRadius: 8,
                            fontSize: 13, fontWeight: 500, cursor: 'pointer',
                            background: activeTab === tab.id ? 'var(--bg-card)' : 'transparent',
                            color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
                            border: 'none', transition: 'all 0.2s',
                            boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none',
                        }}>
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* OVERVIEW */}
            {activeTab === 'overview' && (
                <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                    <div className="card">
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Platform Growth</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Users, AI analyses, and disease scans</div>
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={platformData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                                <defs>
                                    <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gAnalyses" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: '#1a2e1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                                <Area type="monotone" dataKey="users" name="Active Users" stroke="#22c55e" strokeWidth={2} fill="url(#gUsers)" />
                                <Area type="monotone" dataKey="analyses" name="AI Analyses" stroke="#38bdf8" strokeWidth={2} fill="url(#gAnalyses)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Quick stats */}
                        <div className="card">
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>User Roles</div>
                            {[
                                { label: 'Farmers', count: 11840, color: '#22c55e' },
                                { label: 'Agricultural Experts', count: 480, color: '#38bdf8' },
                                { label: 'Administrators', count: 80, color: '#a78bfa' },
                            ].map((r, i) => {
                                const total = 12400
                                const pct = Math.round((r.count / total) * 100)
                                return (
                                    <div key={i} style={{ marginBottom: 14 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                            <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{r.label}</span>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <span style={{ fontSize: 13, fontWeight: 700, color: r.color }}>{r.count.toLocaleString('en-IN')}</span>
                                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pct}%</span>
                                            </div>
                                        </div>
                                        <div className="progress-bar">
                                            <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg,${r.color},${r.color}99)` }} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="card">
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>System Health</div>
                            {[
                                { label: 'API Response Time', value: '124ms', status: 'green' },
                                { label: 'Model Inference Time', value: '340ms', status: 'green' },
                                { label: 'Database Queries', value: '2.4M/day', status: 'green' },
                                { label: 'Error Rate', value: '0.03%', status: 'green' },
                                { label: 'Storage Used', value: '2.84 TB', status: 'warning' },
                            ].map((m, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 4 ? '1px solid var(--border-subtle)' : 'none' }}>
                                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{m.label}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{m.value}</span>
                                        <span className={`status-dot ${m.status}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* USERS */}
            {activeTab === 'users' && (
                <div className="animate-fade-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div className="search-input" style={{ width: 300 }}>
                            <Search size={14} color="var(--text-muted)" />
                            <input placeholder="Search users..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-ghost btn-sm" onClick={handleExportUsers}><Download size={14} /> Export</button>
                            <button className="btn btn-primary btn-sm" onClick={() => toast.success('Invite sent!')}><Plus size={14} /> Invite User</button>
                        </div>
                    </div>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Location</th>
                                    <th>Active Crops</th>
                                    <th>Joined</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(u => (
                                    <tr key={u.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{
                                                    width: 34, height: 34, borderRadius: '50%', background: u.avatar,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: 700, fontSize: 13, color: 'white', flexShrink: 0,
                                                }}>{u.name[0]}</div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</div>
                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${u.role === 'Admin' ? 'badge-red' : u.role === 'Expert' ? 'badge-blue' : 'badge-green'}`}
                                                style={{ fontSize: 11 }}>{u.role}</span>
                                        </td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{u.location}</td>
                                        <td style={{ fontSize: 13 }}>{u.crops}</td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{u.joined}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <span className={`status-dot ${u.status === 'Active' ? 'online' : 'offline'}`} />
                                                <span style={{ fontSize: 13, color: u.status === 'Active' ? '#22c55e' : '#6b7280' }}>{u.status}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button onClick={() => toast.success(`Viewing ${u.name}'s profile`)}
                                                    style={{ padding: 6, borderRadius: 6, background: 'rgba(255,255,255,0.06)', cursor: 'pointer', border: 'none', color: 'var(--gray-400)', display: 'flex', alignItems: 'center' }}>
                                                    <Eye size={13} />
                                                </button>
                                                <button onClick={() => toast.success(`Editing ${u.name}`)}
                                                    style={{ padding: 6, borderRadius: 6, background: 'rgba(255,255,255,0.06)', cursor: 'pointer', border: 'none', color: 'var(--gray-400)', display: 'flex', alignItems: 'center' }}>
                                                    <Edit3 size={13} />
                                                </button>
                                                <button onClick={() => handleToggleStatus(u.id)}
                                                    style={{ padding: 6, borderRadius: 6, background: u.status === 'Active' ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)', cursor: 'pointer', border: 'none', color: u.status === 'Active' ? '#f87171' : '#4ade80', display: 'flex', alignItems: 'center' }}>
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* AI MODELS */}
            {activeTab === 'models' && (
                <div className="animate-fade-in">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {aiModels.map((model, i) => (
                            <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                <div style={{
                                    width: 44, height: 44, background: `${model.color}15`,
                                    borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <Cpu size={20} color={model.color} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{model.name}</span>
                                        <span className="badge badge-green" style={{ fontSize: 10 }}>v{model.version.replace('v', '')}</span>
                                        <span className={`badge ${model.status === 'Active' ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: 10 }}>
                                            {model.status}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 24, fontSize: 12, color: 'var(--text-muted)' }}>
                                        <span>📅 Trained: {model.lastTrained}</span>
                                        <span>⚡ {model.requests}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Accuracy</div>
                                        <div style={{ fontSize: 20, fontWeight: 800, color: model.color }}>{model.accuracy}%</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <button onClick={() => toast.success(`${model.name} retraining queued`)}
                                            className="btn btn-ghost btn-sm">
                                            <RefreshCcw size={13} /> Retrain
                                        </button>
                                        <button onClick={() => toast.success('Settings opened')}
                                            className="btn btn-ghost btn-sm">
                                            <Settings size={13} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* SYSTEM ALERTS */}
            {activeTab === 'alerts' && (
                <div className="animate-fade-in">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {systemAlerts.map((a, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 18px',
                                borderRadius: 'var(--radius-md)', transition: 'all 0.2s',
                                background: a.type === 'error' ? 'rgba(239,68,68,0.06)' :
                                    a.type === 'warning' ? 'rgba(245,158,11,0.06)' :
                                        a.type === 'success' ? 'rgba(34,197,94,0.06)' : 'rgba(59,130,246,0.06)',
                                border: `1px solid ${a.type === 'error' ? 'rgba(239,68,68,0.2)' :
                                    a.type === 'warning' ? 'rgba(245,158,11,0.2)' :
                                        a.type === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(59,130,246,0.2)'}`,
                            }}>
                                {a.type === 'error' ? <AlertTriangle size={16} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} /> :
                                    a.type === 'warning' ? <AlertTriangle size={16} color="#fbbf24" style={{ flexShrink: 0, marginTop: 1 }} /> :
                                        a.type === 'success' ? <CheckCircle size={16} color="#4ade80" style={{ flexShrink: 0, marginTop: 1 }} /> :
                                            <Bell size={16} color="#60a5fa" style={{ flexShrink: 0, marginTop: 1 }} />}
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.5 }}>{a.text}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Clock size={11} /> {a.time}
                                    </div>
                                </div>
                                <button className="btn btn-ghost btn-sm" onClick={() => toast.success('Alert dismissed')}>Dismiss</button>
                            </div>
                        ))}
                    </div>

                    <div className="card" style={{ marginTop: 24 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Configure Alert Rules</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            {[
                                { label: 'Model accuracy drops below', value: '90', unit: '%' },
                                { label: 'API error rate exceeds', value: '0.5', unit: '%' },
                                { label: 'System memory exceeds', value: '85', unit: '%' },
                                { label: 'Response time exceeds', value: '500', unit: 'ms' },
                            ].map((rule, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                                    <span style={{ fontSize: 13, color: 'var(--text-muted)', flex: 1 }}>{rule.label}</span>
                                    <input
                                        type="number"
                                        defaultValue={rule.value}
                                        style={{ width: 60, padding: '6px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-medium)', borderRadius: 6, color: 'var(--text-primary)', fontSize: 13, outline: 'none', textAlign: 'center' }}
                                    />
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{rule.unit}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: 16 }}>
                            <button className="btn btn-primary btn-sm" onClick={() => toast.success('Alert rules saved!')}>
                                <CheckCircle size={14} /> Save Rules
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
