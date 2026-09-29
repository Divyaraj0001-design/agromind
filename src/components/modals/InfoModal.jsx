import { useEffect } from 'react'
import { X, Info, TrendingUp, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react'

export default function InfoModal({ data, onClose }) {
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', handleKey)
        // Do NOT set body overflow:hidden — it blocks our scroll wrapper in Chrome/Safari
        return () => {
            window.removeEventListener('keydown', handleKey)
        }
    }, [onClose])

    if (!data) return null

    const typeColor = {
        info: '#38bdf8',
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
        purple: '#a78bfa',
    }[data.type || 'info']

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0, zIndex: 9998,
                    background: 'rgba(0,0,0,0.65)',
                    backdropFilter: 'blur(8px)',
                    animation: 'fadeIn 0.18s ease',
                }}
            />

            {/* Scroll wrapper — this scrolls, not the modal */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 9999,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    padding: '32px 20px 60px',
                    WebkitOverflowScrolling: 'touch',
                    boxSizing: 'border-box',
                }}
            >
                {/* Modal card */}
                <div
                    onClick={e => e.stopPropagation()}
                    style={{
                        background: 'linear-gradient(135deg, rgba(22,34,22,0.99) 0%, rgba(13,26,13,0.99) 100%)',
                        border: `1px solid ${typeColor}35`,
                        borderRadius: 20,
                        maxWidth: 520,
                        width: '100%',
                        boxShadow: `0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px ${typeColor}15, inset 0 1px 0 rgba(255,255,255,0.06)`,
                        animation: 'slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                        overflow: 'visible',
                        flexShrink: 0,
                    }}
                >
                    {/* Header — sticky inside modal */}
                    <div style={{
                        padding: '20px 24px 16px',
                        borderBottom: `1px solid rgba(255,255,255,0.06)`,
                        background: `linear-gradient(135deg, ${typeColor}14, ${typeColor}06)`,
                        borderRadius: '20px 20px 0 0',
                        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                                width: 44, height: 44,
                                background: `${typeColor}20`,
                                border: `1px solid ${typeColor}35`,
                                borderRadius: 12,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <span style={{ fontSize: 22 }}>{data.icon || '📊'}</span>
                            </div>
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
                                    {data.title}
                                </div>
                                {data.subtitle && (
                                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                                        {data.subtitle}
                                    </div>
                                )}
                            </div>
                        </div>
                        <button onClick={onClose} style={{
                            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)',
                            borderRadius: 8, width: 32, height: 32, cursor: 'pointer',
                            color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, transition: 'all 0.15s',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#fff' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}>
                            <X size={15} />
                        </button>
                    </div>

                    {/* Current Value */}
                    {data.value && (
                        <div style={{
                            padding: '20px 24px 0',
                            display: 'flex', alignItems: 'center', gap: 16,
                        }}>
                            <div style={{
                                fontSize: 40, fontWeight: 900, color: typeColor,
                                letterSpacing: '-0.04em', lineHeight: 1,
                            }}>
                                {data.value}
                            </div>
                            {data.trend && (
                                <div style={{
                                    fontSize: 13, fontWeight: 600,
                                    color: data.trend.includes('↑') || data.trend.startsWith('+') ? '#22c55e'
                                        : data.trend.includes('↓') || data.trend.startsWith('-') ? '#ef4444'
                                            : '#94a3b8',
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    padding: '4px 10px',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: 20,
                                    border: '1px solid rgba(255,255,255,0.08)',
                                }}>
                                    <TrendingUp size={12} />
                                    {data.trend}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Body */}
                    <div style={{ padding: '16px 24px 0' }}>
                        {/* What is this */}
                        <div style={{ marginBottom: 16 }}>
                            <div style={{
                                fontSize: 11, fontWeight: 700, color: typeColor,
                                textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 8,
                                display: 'flex', alignItems: 'center', gap: 6,
                            }}>
                                <Info size={11} /> What is this?
                            </div>
                            <div style={{
                                fontSize: 14, color: 'rgba(255,255,255,0.82)',
                                lineHeight: 1.7, background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                borderRadius: 10, padding: '12px 14px',
                            }}>
                                {data.description}
                            </div>
                        </div>

                        {/* Key Points */}
                        {data.points && data.points.length > 0 && (
                            <div style={{ marginBottom: 16 }}>
                                <div style={{
                                    fontSize: 11, fontWeight: 700, color: typeColor,
                                    textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 10,
                                    display: 'flex', alignItems: 'center', gap: 6,
                                }}>
                                    <CheckCircle size={11} /> Key Points
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {data.points.map((pt, i) => (
                                        <div key={i} style={{
                                            display: 'flex', gap: 10, alignItems: 'flex-start',
                                            fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.55,
                                            padding: '8px 12px',
                                            background: 'rgba(255,255,255,0.025)',
                                            borderRadius: 8,
                                            border: '1px solid rgba(255,255,255,0.05)',
                                        }}>
                                            <div style={{
                                                width: 20, height: 20, background: `${typeColor}20`,
                                                border: `1px solid ${typeColor}30`,
                                                borderRadius: '50%', display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', flexShrink: 0, marginTop: 1,
                                            }}>
                                                <span style={{ fontSize: 10, color: typeColor, fontWeight: 800 }}>{i + 1}</span>
                                            </div>
                                            {pt}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tip */}
                        {data.tip && (
                            <div style={{
                                marginBottom: 8,
                                padding: '13px 15px',
                                background: `${typeColor}12`,
                                border: `1px solid ${typeColor}28`,
                                borderRadius: 12,
                                display: 'flex', gap: 10, alignItems: 'flex-start',
                            }}>
                                <Lightbulb size={15} color={typeColor} style={{ flexShrink: 0, marginTop: 2 }} />
                                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.82)', lineHeight: 1.6 }}>
                                    <strong style={{ color: typeColor }}>Tip: </strong>{data.tip}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{
                        padding: '16px 24px 22px',
                        display: 'flex', justifyContent: 'flex-end', gap: 10,
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        marginTop: 16,
                    }}>
                        <button onClick={onClose} style={{
                            padding: '9px 24px', borderRadius: 10, cursor: 'pointer',
                            background: `linear-gradient(135deg, ${typeColor}, ${typeColor}cc)`,
                            border: 'none', color: '#000', fontSize: 13, fontWeight: 700,
                            transition: 'all 0.2s',
                            boxShadow: `0 4px 16px ${typeColor}45`,
                            letterSpacing: '0.01em',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 6px 24px ${typeColor}60` }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 16px ${typeColor}45` }}
                        >
                            Got it! ✓
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(0.95) } to { opacity: 1; transform: translateY(0) scale(1) } }
            `}</style>
        </>
    )
}
