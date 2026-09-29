import { useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopNav from './TopNav'

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(true)

    if (!localStorage.getItem('agromind_token')) {
        return <Navigate to="/login" replace />
    }

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#0a0a0a', color: '#fff', overflow: 'hidden' }}>
            {sidebarOpen && <Sidebar />}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <TopNav onToggleSidebar={() => setSidebarOpen(o => !o)} />
                <main style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
                    <div style={{ maxWidth: 1400, margin: '0 auto', width: '100%' }}>
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}
