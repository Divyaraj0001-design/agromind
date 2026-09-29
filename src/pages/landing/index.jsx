import { Link } from 'react-router-dom'
import {
    Leaf, ArrowRight, Sprout, Droplets, Cloud, TrendingUp,
    Bug, BarChart3, Shield, Star, ChevronRight, Play,
    Check, Cpu, Globe, Zap
} from 'lucide-react'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const features = [
    { icon: Sprout, title: 'AI Crop Advisor', desc: 'Get personalized crop recommendations based on soil type, climate, and market conditions.', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
    { icon: Bug, title: 'Disease Detection', desc: 'Upload plant images to instantly identify diseases and get treatment recommendations.', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { icon: Droplets, title: 'Smart Irrigation', desc: 'AI-driven water management reduces usage by up to 40% while maximizing crop yield.', color: '#38bdf8', bg: 'rgba(56,189,248,0.1)' },
    { icon: Cloud, title: 'Weather Intelligence', desc: 'Hyperlocal forecasts and alerts tailored to your exact farm location and crop type.', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
    { icon: TrendingUp, title: 'Market Insights', desc: 'Real-time price trends and AI predictions to help you sell at the perfect time.', color: '#fb923c', bg: 'rgba(251,146,60,0.1)' },
    { icon: BarChart3, title: 'Farm Analytics', desc: 'Track expenses, harvests, and productivity with beautiful visual dashboards.', color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
]

const stats = [
    { value: '12,400+', label: 'Farmers Empowered', suffix: '' },
    { value: '98.2', label: 'Disease Detection Accuracy', suffix: '%' },
    { value: '38', label: 'Water Usage Reduced', suffix: '%' },
    { value: '2.4×', label: 'Average Yield Increase', suffix: '' },
]

const testimonials = [
    {
        name: 'Harpreet Singh',
        role: 'Wheat Farmer · Punjab',
        text: 'AgroMind transformed how I manage my 45-acre farm. The disease detection saved my entire wheat crop last season.',
        stars: 5,
    },
    {
        name: 'Sunita Patel',
        role: 'Vegetable Grower · Gujarat',
        text: 'The market insights helped me time my tomato sales perfectly. I earned 28% more than last year.',
        stars: 5,
    },
    {
        name: 'Ramesh Verma',
        role: 'Rice Farmer · West Bengal',
        text: 'Smart irrigation alone saved me ₹80,000 in water costs. The AI recommendations are spot-on.',
        stars: 5,
    },
]

const techStack = [
    { icon: Cpu, label: 'Machine Learning', desc: 'TensorFlow & PyTorch models' },
    { icon: Globe, label: 'Real-time Data', desc: 'Satellite & IoT sensors' },
    { icon: Shield, label: 'Secure & Private', desc: 'End-to-end encrypted' },
    { icon: Zap, label: 'Lightning Fast', desc: 'Sub-second AI responses' },
]

export default function Landing() {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handler)
        return () => window.removeEventListener('scroll', handler)
    }, [])

    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
            {/* NAVBAR */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                padding: '0 40px',
                height: 64,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: scrolled ? 'rgba(13,26,13,0.9)' : 'transparent',
                backdropFilter: scrolled ? 'blur(20px)' : 'none',
                borderBottom: scrolled ? '1px solid var(--border-subtle)' : 'none',
                transition: 'all 0.3s ease',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 36, height: 36,
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(34,197,94,0.4)',
                    }}>
                        <Leaf size={18} color="white" />
                    </div>
                    <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>
                        AgroMind
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {['Features', 'Technology', 'Testimonials'].map(item => (
                        <a key={item} href={`#${item.toLowerCase()}`} style={{
                            padding: '8px 16px',
                            fontSize: 14, fontWeight: 500,
                            color: 'var(--gray-400)',
                            borderRadius: 8,
                            transition: 'color 0.2s',
                        }}
                            onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
                            onMouseLeave={e => e.target.style.color = 'var(--gray-400)'}
                        >
                            {item}
                        </a>
                    ))}
                    <Link to="/app/dashboard">
                        <button className="btn btn-primary btn-sm">
                            Open Dashboard <ArrowRight size={14} />
                        </button>
                    </Link>
                </div>
            </nav>

            {/* HERO */}
            <section style={{
                minHeight: '100vh',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center',
                padding: '120px 24px 80px',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Background effects */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(34,197,94,0.12) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute',
                    top: '20%', left: '10%',
                    width: 300, height: 300,
                    background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)',
                    borderRadius: '50%', pointerEvents: 'none',
                    animation: 'float 6s ease-in-out infinite',
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '20%', right: '10%',
                    width: 200, height: 200,
                    background: 'radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 70%)',
                    borderRadius: '50%', pointerEvents: 'none',
                    animation: 'float 8s ease-in-out infinite reverse',
                }} />

                <div style={{ maxWidth: 800, position: 'relative', zIndex: 1 }} className="animate-fade-in">
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '6px 16px 6px 6px',
                        background: 'rgba(34,197,94,0.08)',
                        border: '1px solid rgba(34,197,94,0.2)',
                        borderRadius: 100,
                        marginBottom: 32,
                    }}>
                        <span className="badge badge-green" style={{ fontSize: 11 }}>NEW</span>
                        <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>AI Crop Disease Detection v2.0 is live</span>
                        <ChevronRight size={14} color="var(--accent-primary)" />
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(40px, 7vw, 80px)',
                        fontWeight: 900,
                        lineHeight: 1.05,
                        letterSpacing: '-0.04em',
                        color: 'var(--text-primary)',
                        marginBottom: 24,
                    }}>
                        Farm Smarter with <br />
                        <span className="gradient-text">AI-Powered</span> <br />
                        Agriculture
                    </h1>

                    <p style={{
                        fontSize: 'clamp(16px, 2vw, 20px)',
                        color: 'var(--text-muted)',
                        lineHeight: 1.7,
                        maxWidth: 600,
                        margin: '0 auto 40px',
                    }}>
                        AgroMind brings the power of artificial intelligence to every farmer.
                        Get real-time crop insights, disease detection, smart irrigation, and
                        market intelligence — all in one beautiful platform.
                    </p>

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/app/dashboard">
                            <button className="btn btn-primary btn-lg" style={{ fontSize: 15 }}>
                                Start Free Trial <ArrowRight size={18} />
                            </button>
                        </Link>
                        <button className="btn btn-ghost btn-lg" style={{ fontSize: 15 }}
                            onClick={() => toast('🎬 Demo video loading... Check our YouTube channel for live demos!', { icon: '📺', duration: 3000 })}>
                            <Play size={16} /> Watch Demo
                        </button>
                    </div>

                    <div style={{
                        marginTop: 48,
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        gap: 24, flexWrap: 'wrap',
                    }}>
                        {['No credit card required', 'Free for small farms', '24/7 AI support'].map(item => (
                            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Check size={14} color="var(--accent-primary)" />
                                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* STATS */}
            <section style={{ padding: '0 24px 80px' }}>
                <div style={{
                    maxWidth: 1100, margin: '0 auto',
                    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20,
                }}
                    className="grid-4"
                >
                    {stats.map((s, i) => (
                        <div key={i} style={{
                            textAlign: 'center',
                            padding: '32px 24px',
                            background: 'var(--bg-card)',
                            borderRadius: 'var(--radius-xl)',
                            border: '1px solid var(--border-subtle)',
                            transition: 'all 0.3s ease',
                        }}>
                            <div style={{
                                fontSize: 42, fontWeight: 900,
                                letterSpacing: '-0.04em',
                                color: 'var(--text-primary)',
                                lineHeight: 1,
                            }} className="gradient-text">
                                {s.value}{s.suffix}
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* FEATURES */}
            <section id="features" style={{ padding: '80px 24px' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 64 }}>
                        <div className="badge badge-green" style={{ marginBottom: 16 }}>
                            <Sprout size={12} /> Features
                        </div>
                        <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: 16 }}>
                            Everything your farm needs
                        </h2>
                        <p style={{ fontSize: 16, color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto' }}>
                            From seed to harvest, AgroMind's AI tools help you make better decisions at every stage.
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 20,
                    }} className="grid-3">
                        {features.map((f, i) => (
                            <div key={i} className="card" style={{ padding: 28 }}>
                                <div style={{
                                    width: 48, height: 48,
                                    background: f.bg,
                                    borderRadius: 14,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: 16,
                                }}>
                                    <f.icon size={22} color={f.color} />
                                </div>
                                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                                    {f.title}
                                </h3>
                                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                    {f.desc}
                                </p>
                                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                                    onClick={() => toast(`🌱 Explore ${f.title} in the dashboard!`, { duration: 2500 })}>
                                    <span style={{ fontSize: 13, color: f.color, fontWeight: 500 }}>Learn more</span>
                                    <ChevronRight size={14} color={f.color} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TECHNOLOGY */}
            <section id="technology" style={{
                padding: '80px 24px',
                background: 'linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)',
            }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60,
                        alignItems: 'center',
                    }}>
                        <div>
                            <div className="badge badge-earth" style={{ marginBottom: 20 }}>
                                <Cpu size={12} /> Technology
                            </div>
                            <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: 20 }}>
                                Cutting-edge AI for every farmer
                            </h2>
                            <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 32 }}>
                                Our platform uses state-of-the-art machine learning models trained on millions of agricultural data points.
                                From satellite imagery to soil sensors, we process every signal to give you the most accurate insights.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {techStack.map((t, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                                        <div style={{
                                            width: 40, height: 40,
                                            background: 'rgba(34,197,94,0.1)',
                                            borderRadius: 10,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            <t.icon size={18} color="var(--accent-primary)" />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{t.label}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <div style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-xl)',
                                padding: 28,
                                boxShadow: 'var(--shadow-glow)',
                            }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    AI Processing Pipeline
                                </div>
                                {[
                                    { label: 'Satellite Imagery Analysis', pct: 94, color: '#22c55e' },
                                    { label: 'Soil Data Interpretation', pct: 87, color: '#38bdf8' },
                                    { label: 'Disease Pattern Recognition', pct: 98, color: '#f59e0b' },
                                    { label: 'Market Price Prediction', pct: 82, color: '#a78bfa' },
                                    { label: 'Weather Forecast Accuracy', pct: 91, color: '#fb923c' },
                                ].map((bar, i) => (
                                    <div key={i} style={{ marginBottom: 16 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                            <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{bar.label}</span>
                                            <span style={{ fontSize: 13, fontWeight: 700, color: bar.color }}>{bar.pct}%</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div className="progress-fill" style={{ width: `${bar.pct}%`, background: `linear-gradient(90deg, ${bar.color}, ${bar.color}aa)` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Floating badge */}
                            <div style={{
                                position: 'absolute', top: -16, right: -16,
                                background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                                borderRadius: 12, padding: '8px 14px',
                                fontSize: 13, fontWeight: 700, color: 'white',
                                boxShadow: '0 8px 24px rgba(34,197,94,0.4)',
                            }}>
                                98.2% Accuracy
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section id="testimonials" style={{ padding: '80px 24px' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 64 }}>
                        <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: 12 }}>
                            Trusted by farmers across India
                        </h2>
                        <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>Real stories from farmers who transformed their yields</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="grid-3">
                        {testimonials.map((t, i) => (
                            <div key={i} className="card" style={{ padding: 28 }}>
                                <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                                    {[...Array(t.stars)].map((_, j) => (
                                        <Star key={j} size={14} color="#fbbf24" fill="#fbbf24" />
                                    ))}
                                </div>
                                <p style={{ fontSize: 14, color: 'var(--gray-300)', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>
                                    "{t.text}"
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div className="avatar-placeholder" style={{
                                        width: 40, height: 40, fontSize: 15, flexShrink: 0,
                                        background: `linear-gradient(135deg, hsl(${i * 60 + 120},70%,40%), hsl(${i * 60 + 140},70%,30%))`,
                                    }}>
                                        {t.name[0]}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{t.name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section style={{ padding: '80px 24px 120px' }}>
                <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.04))',
                        border: '1px solid rgba(34,197,94,0.2)',
                        borderRadius: 'var(--radius-2xl)',
                        padding: '64px 48px',
                    }}>
                        <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: 16 }}>
                            Ready to transform <br />your farm?
                        </h2>
                        <p style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 32, lineHeight: 1.6 }}>
                            Join over 12,000 farmers who are already growing smarter with AgroMind's AI platform.
                        </p>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/app/dashboard">
                                <button className="btn btn-primary btn-lg">
                                    Get Started Free <ArrowRight size={18} />
                                </button>
                            </Link>
                            <button className="btn btn-secondary btn-lg"
                                onClick={() => toast.success('📞 Expert connect request sent! We will reach out within 24 hours.')}
                            >
                                Talk to an Expert
                            </button>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 20 }}>
                            No setup fees · Cancel anytime · Free for farms under 10 acres
                        </p>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer style={{
                borderTop: '1px solid var(--border-subtle)',
                padding: '40px 40px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: 16,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 28, height: 28,
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Leaf size={14} color="white" />
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>AgroMind</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    © 2026 AgroMind. Empowering farmers with AI.
                </p>
                <div style={{ display: 'flex', gap: 24 }}>
                    {['Privacy', 'Terms', 'Support'].map(l => (
                        <a key={l} href="#" style={{ fontSize: 13, color: 'var(--text-muted)', transition: 'color 0.2s' }}
                            onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
                            onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                        >{l}</a>
                    ))}
                </div>
            </footer>
        </div>
    )
}
