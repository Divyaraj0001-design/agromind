import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Sprout, Mail, Lock, User, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { API_BASE } from '../../hooks/useApi'

export default function Login() {
    const navigate = useNavigate()
    const [isLoginView, setIsLoginView] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    })

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.email || !formData.password || (!isLoginView && !formData.name)) {
            toast.error('Please fill in all fields')
            return
        }

        setIsLoading(true)

        try {
            const endpoint = isLoginView ? '/api/login' : '/api/register'
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (!response.ok) {
                toast.error(data.error || 'Authentication failed')
                setIsLoading(false)
                return
            }

            // Save token and navigate
            localStorage.setItem('agromind_token', data.token)
            localStorage.setItem('agromind_user', JSON.stringify(data.user))

            toast.success(isLoginView ? `Welcome back, ${data.user.name}!` : 'Account created successfully!')

            // Short delay for the animation
            setTimeout(() => {
                navigate('/app/dashboard')
            }, 500)

        } catch (error) {
            console.error('Auth error:', error)
            toast.error('Network error. Please try again.')
            setIsLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'radial-gradient(circle at top right, rgba(34,197,94,0.15) 0%, transparent 40%), linear-gradient(135deg, #0a0e0a 0%, #111a11 100%)',
            padding: 24, position: 'relative', overflow: 'hidden'
        }}>
            <div style={{
                position: 'absolute', width: 600, height: 600, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 70%)',
                top: -200, left: -200, pointerEvents: 'none'
            }} />

            <div style={{
                width: '100%', maxWidth: 460,
                background: 'rgba(22, 30, 22, 0.7)',
                backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
                borderRadius: 24, padding: '48px 40px', position: 'relative', zIndex: 1
            }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 16,
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 16px rgba(34, 197, 94, 0.25)',
                        margin: '0 auto 20px'
                    }}>
                        <Sprout size={32} color="#fff" />
                    </div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
                        {isLoginView ? 'Welcome back' : 'Create an Account'}
                    </h1>
                    <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                        {isLoginView ? 'Log in to manage your smart farm' : 'Join AgroMind to digitize your farm'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {!isLoginView && (
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 8, letterSpacing: '0.02em' }}>
                                Full Name
                            </label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', top: 14, left: 16 }} />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Rajan Kumar"
                                    style={{
                                        width: '100%', padding: '12px 16px 12px 42px',
                                        background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 12, color: '#fff', fontSize: 15,
                                        outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box'
                                    }}
                                    onFocus={e => { e.target.style.borderColor = '#22c55e'; e.target.style.background = 'rgba(34,197,94,0.05)' }}
                                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(0,0,0,0.3)' }}
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 8, letterSpacing: '0.02em' }}>
                            Email Address
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', top: 14, left: 16 }} />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="rajan@agromind.com"
                                style={{
                                    width: '100%', padding: '12px 16px 12px 42px',
                                    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 12, color: '#fff', fontSize: 15,
                                    outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box'
                                }}
                                onFocus={e => { e.target.style.borderColor = '#22c55e'; e.target.style.background = 'rgba(34,197,94,0.05)' }}
                                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(0,0,0,0.3)' }}
                            />
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <label style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.02em' }}>
                                Password
                            </label>
                            {isLoginView && (
                                <a href="#" style={{ fontSize: 13, color: '#22c55e', textDecoration: 'none', fontWeight: 500 }}>
                                    Forgot password?
                                </a>
                            )}
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', top: 14, left: 16 }} />
                            <input
                                type="password"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                style={{
                                    width: '100%', padding: '12px 16px 12px 42px',
                                    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 12, color: '#fff', fontSize: 15,
                                    outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box'
                                }}
                                onFocus={e => { e.target.style.borderColor = '#22c55e'; e.target.style.background = 'rgba(34,197,94,0.05)' }}
                                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(0,0,0,0.3)' }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%', padding: '14px', marginTop: 12,
                            background: isLoading ? '#166534' : '#22c55e',
                            color: isLoading ? 'rgba(255,255,255,0.5)' : '#000',
                            border: 'none', borderRadius: 12,
                            fontSize: 15, fontWeight: 700,
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            transition: 'all 0.2s',
                            boxShadow: isLoading ? 'none' : '0 4px 16px rgba(34, 197, 94, 0.3)'
                        }}
                    >
                        {isLoading ? 'Processing...' : (
                            <>
                                {isLoginView ? 'Sign In' : 'Create Account'}
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 32 }}>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
                        {isLoginView ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => {
                                setIsLoginView(!isLoginView)
                                setFormData({ name: '', email: '', password: '' })
                            }}
                            style={{
                                color: '#fff', fontWeight: 600, background: 'none', border: 'none',
                                padding: 0, cursor: 'pointer', fontSize: 14
                            }}
                        >
                            {isLoginView ? 'Create one now' : 'Sign in instead'}
                        </button>
                    </p>
                </div>
            </div>

            <Link to="/" style={{
                position: 'absolute', top: 32, left: 32,
                color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
                fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6
            }}>
                ← Back to Home
            </Link>
        </div>
    )
}
