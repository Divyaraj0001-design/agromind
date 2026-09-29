import { Bell, Search, Settings, Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function TopNav() {
    const location = useLocation()
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
                <button style={{
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
                    padding: '10px 16px', borderRadius: 12, width: 280
                }}>
                    <Search size={18} color="rgba(255,255,255,0.4)" />
                    <input
                        type="text"
                        placeholder="Search..."
                        style={{
                            background: 'transparent', border: 'none', outline: 'none',
                            color: '#fff', fontSize: 14, width: '100%'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    <button style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'rgba(255,255,255,0.7)', cursor: 'pointer', position: 'relative'
                    }}>
                        <Bell size={20} />
                        <span style={{
                            position: 'absolute', top: 10, right: 10,
                            width: 8, height: 8, background: '#ef4444', borderRadius: '50%',
                            border: '2px solid rgba(18,24,18,1)'
                        }} />
                    </button>
                    <button style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'rgba(255,255,255,0.7)', cursor: 'pointer'
                    }}>
                        <Settings size={20} />
                    </button>

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
