import { NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
    LayoutDashboard, UserCircle, Settings, Sprout, Bug, Droplets,
    CloudRain, TrendingUp, ClipboardList, Shield, LogOut, RotateCcw, Globe
} from 'lucide-react'

const navGroups = [
    {
        label: 'OVERVIEW',
        items: [
            { icon: LayoutDashboard, label: 'Dashboard', path: '/app/dashboard' },
        ]
    },
    {
        label: 'AI TOOLS',
        items: [
            { icon: Sprout, label: 'Crop Advisor', path: '/app/crop-advisor' },
            { icon: Bug, label: 'Disease Detection', path: '/app/disease-detection' },
            { icon: Droplets, label: 'Irrigation Planner', path: '/app/irrigation' },
            { icon: CloudRain, label: 'Weather Intel', path: '/app/weather' },
        ]
    },
    {
        label: 'FARM MANAGEMENT',
        items: [
            { icon: TrendingUp, label: 'Market Insights', path: '/app/market' },
            { icon: ClipboardList, label: 'Farm Records', path: '/app/records' },
        ]
    },
    {
        label: 'BRICS TRACK',
        items: [
            { icon: RotateCcw, label: 'Regen Agriculture', path: '/app/regen' },
            { icon: Globe, label: 'BRICS Network', path: '/app/brics' },
        ]
    },
    {
        label: 'ADMINISTRATION',
        items: [
            { icon: Shield, label: 'Admin Panel', path: '/app/admin' },
        ]
    }
]

export default function Sidebar() {
    const navigate = useNavigate()
    const [user, setUser] = useState({ name: 'User' })

    useEffect(() => {
        const storedUser = localStorage.getItem('agromind_user')
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
    }, [])

    return (
        <aside style={{
            width: 280,
            background: 'rgba(18, 24, 18, 0.95)',
            borderRight: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', flexDirection: 'column',
            position: 'relative', zIndex: 10
        }}>
            <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                }}>
                    <Sprout size={24} color="#fff" />
                </div>
                <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>AgroMind</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '1px' }}>SMART FARMING</div>
                </div>
            </div>

            <nav style={{ flex: 1, overflowY: 'auto', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
                {navGroups.map((group, idx) => (
                    <div key={idx}>
                        <div style={{
                            fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)',
                            marginBottom: 8, paddingLeft: 12, letterSpacing: '1px'
                        }}>
                            {group.label}
                        </div>
                        {group.items.map((item, i) => (
                            <NavLink
                                key={i}
                                to={item.path}
                                style={({ isActive }) => ({
                                    display: 'flex', alignItems: 'center', gap: 14,
                                    padding: '12px 16px', borderRadius: 12,
                                    color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                                    background: isActive ? 'linear-gradient(90deg, rgba(34,197,94,0.15) 0%, transparent 100%)' : 'transparent',
                                    borderLeft: `3px solid ${isActive ? '#22c55e' : 'transparent'}`,
                                    textDecoration: 'none', fontSize: 14, fontWeight: isActive ? 600 : 500,
                                    transition: 'all 0.2s ease',
                                    marginBottom: 4
                                })}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            <div style={{ padding: '24px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px', background: 'rgba(255,255,255,0.03)',
                    borderRadius: 12, marginBottom: 12
                }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: '50%', background: '#22c55e',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#000', fontWeight: 700
                    }}>
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>{user.name}</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Farmer · India</div>
                    </div>
                </div>

                <button
                    onClick={() => {
                        localStorage.removeItem('agromind_token')
                        localStorage.removeItem('agromind_user')
                        navigate('/login')
                    }}
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                        padding: '12px', background: 'rgba(239, 68, 68, 0.05)',
                        border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: 12,
                        color: '#ef4444', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => {
                        e.target.style.background = 'rgba(239, 68, 68, 0.15)'
                        e.target.style.borderColor = 'rgba(239, 68, 68, 0.25)'
                    }}
                    onMouseLeave={e => {
                        e.target.style.background = 'rgba(239, 68, 68, 0.05)'
                        e.target.style.borderColor = 'rgba(239, 68, 68, 0.15)'
                    }}
                >
                    <LogOut size={16} />
                    Log Out
                </button>
            </div>
        </aside>
    )
}
