import { Bell, Search, Settings, Menu } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useNotifications } from '../../hooks/useNotifications'

export default function TopNav({ onToggleSidebar }) {
    const location = useLocation()
    const navigate = useNavigate()
    const [query, setQuery] = useState('')
    const [panel, setPanel] = useState(null) // 'bell' | 'settings' | null
    const { notifications, unreadCount, records, markRead, markAllRead } = useNotifications()
    const [user, setUser] = useState({ name: 'User' })

    useEffect(() => {
        const storedUser = localStorage.getItem('agromind_user')
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
    }, [])

    const pageTitles = {
        '/app/dashboard': { title: 'Dashboard', subtitle: `Good morning, ${user.name.split(' ')[0]} 👋` },
        '/app/crop-advisor': { title: 'AI Crop Advisor', subtitle: 'Get personalized AI recommendations for your fields' },
        '/app/disease-detection': { title: 'Disease Detection', subtitle: 'Upload plant photos for instant AI diagnosis' },
        '/app/irrigation': { title: 'Irrigation Planner', subtitle: 'Smart water management and scheduling' },
        '/app/weather': { title: 'Weather Intelligence', subtitle: 'Hyperlocal forecasts and farming alerts' },
        '/app/market': { title: 'Market Insights', subtitle: 'Track crop prices and trends' },
        '/app/records': { title: 'Farm Records', subtitle: 'Manage your farm data and logs' },
        '/app/regen': { title: 'Regenerative Agriculture', subtitle: 'AI-powered crop rotation and soil health recommendations' },
        '/app/brics': { title: 'BRICS Network', subtitle: 'Collaborative farm intelligence across BRICS regions' },
        '/app/admin': { title: 'Admin Panel', subtitle: 'System overview and user management' }
    }

    const q = query.trim().toLowerCase()
    const matches = q
        ? [
            ...Object.entries(pageTitles)
                .filter(([, v]) => v.title.toLowerCase().includes(q))
                .map(([path, v]) => ({ key: path, label: v.title, path })),
            ...records
                .filter(r => `${r.crop} ${r.field}`.toLowerCase().includes(q))
                .map(r => ({ key: `record-${r.id}`, label: `${r.crop} — ${r.field}`, hint: 'Farm record', path: '/app/records' })),
        ]
        : []

    const goTo = (path) => {
        setQuery('')
        navigate(path)
    }

    const logout = () => {
        localStorage.removeItem('agromind_token')
        localStorage.removeItem('agromind_user')
        navigate('/login')
    }

    const dropdownStyle = {
        position: 'absolute', top: 52, right: 0, minWidth: 220, zIndex: 20,
        background: 'rgba(18,24,18,0.98)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12, padding: 8, fontSize: 14, color: 'rgba(255,255,255,0.8)'
    }
    const itemStyle = {
        display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px',
        background: 'transparent', border: 'none', borderRadius: 8, color: 'inherit', cursor: 'pointer', fontSize: 14
    }

    const current = pageTitles[location.pathname] || { title: 'AgroMind', subtitle: 'Smart Farming Platform' }

    return (
        <header style={{
            height: 80,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 32px',
            background: 'rgba(18, 24, 18, 0.7)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            position: 'sticky', top: 0, zIndex: 10
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button onClick={onToggleSidebar} style={{
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 40, height: 40, borderRadius: 12, color: '#fff', cursor: 'pointer'
                }}>
                    <Menu size={20} />
                </button>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>
                        {current.title}
                    </h1>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '2px 0 0 0' }}>
                        {current.subtitle}
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                    padding: '10px 16px', borderRadius: 12, width: 280, position: 'relative'
                }}>
                    <Search size={18} color="rgba(255,255,255,0.4)" />
                    <input
                        type="text"
                        placeholder="Search pages..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && matches[0]) goTo(matches[0].path) }}
                        style={{
                            background: 'transparent', border: 'none', outline: 'none',
                            color: '#fff', fontSize: 14, width: '100%'
                        }}
                    />
                    {query.trim() && (
                        <div style={{ ...dropdownStyle, top: 48, left: 0, right: 'auto', width: '100%' }}>
                            {matches.length === 0
                                ? <div style={{ padding: '8px 12px' }}>No pages found</div>
                                : matches.map(m => (
                                    <button key={m.key} style={itemStyle} onClick={() => goTo(m.path)}>
                                        {m.label}
                                        {m.hint && <span style={{ float: 'right', fontSize: 12, opacity: 0.5 }}>{m.hint}</span>}
                                    </button>
                                ))}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ position: 'relative' }}>
                    <button onClick={() => setPanel(p => p === 'bell' ? null : 'bell')} style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'rgba(255,255,255,0.7)', cursor: 'pointer', position: 'relative'
                    }}>
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span style={{
                                position: 'absolute', top: 10, right: 10,
                                width: 8, height: 8, background: '#ef4444', borderRadius: '50%',
                                border: '2px solid rgba(18,24,18,1)'
                            }} />
                        )}
                    </button>
                    {panel === 'bell' && (
                        <div style={{ ...dropdownStyle, width: 340, maxHeight: 400, overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 12px 8px' }}>
                                <strong style={{ color: '#fff' }}>Notifications</strong>
                                {unreadCount > 0 && (
                                    <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer', fontSize: 12 }}>
                                        Mark all read
                                    </button>
                                )}
                            </div>
                            {notifications.length === 0
                                ? <div style={{ padding: '8px 12px' }}>You're all caught up.</div>
                                : notifications.map(n => (
                                    <button
                                        key={n.id}
                                        style={{ ...itemStyle, opacity: n.read ? 0.5 : 1, borderLeft: `3px solid ${n.type === 'danger' ? '#ef4444' : n.type === 'warning' ? '#f59e0b' : '#22c55e'}` }}
                                        onClick={() => { markRead(n.id); setPanel(null); navigate(n.path) }}
                                    >
                                        <div style={{ fontWeight: 600, color: '#fff' }}>{n.title}</div>
                                        <div style={{ fontSize: 13 }}>{n.message}</div>
                                    </button>
                                ))}
                        </div>
                    )}
                    </div>
                    <div style={{ position: 'relative' }}>
                    <button onClick={() => setPanel(p => p === 'settings' ? null : 'settings')} style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'rgba(255,255,255,0.7)', cursor: 'pointer'
                    }}>
                        <Settings size={20} />
                    </button>
                    {panel === 'settings' && (
                        <div style={dropdownStyle}>
                            <button style={itemStyle} onClick={logout}>Log out</button>
                        </div>
                    )}
                    </div>

                    <button style={{
                        height: 44, padding: '0 16px 0 6px', borderRadius: 22,
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', gap: 10,
                        color: 'rgba(255,255,255,0.8)', cursor: 'pointer'
                    }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%', background: '#22c55e',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#000', fontWeight: 700, fontSize: 13
                        }}>
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{user.name.split(' ')[0]} </span>
                    </button>
                </div>
            </div>
        </header>
    )
}
