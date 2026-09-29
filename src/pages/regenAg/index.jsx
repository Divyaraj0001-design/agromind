import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Leaf, RotateCcw, AlertCircle, RefreshCw, ChevronDown, ChevronUp,
    Globe, Sprout, Droplets, Clock, Info, CheckCircle2, Loader2, ArrowRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useApi } from '../../hooks/useApi'

// ── Severity badge colors ────────────────────────────────────────────────────
const confidenceColor = (c) => c >= 90 ? '#22c55e' : c >= 80 ? '#38bdf8' : c >= 70 ? '#f59e0b' : '#a78bfa'

const riskColor = { Low: '#22c55e', Medium: '#f59e0b', High: '#ef4444' }

function SkeletonCard() {
    return (
        <div className="card" style={{ opacity: 0.5 }}>
            {[60, 40, 80, 30].map((w, i) => (
                <div key={i} style={{
                    height: 14, width: `${w}%`, background: 'rgba(255,255,255,0.08)',
                    borderRadius: 6, marginBottom: 12, animation: 'pulse 1.5s infinite'
                }} />
            ))}
        </div>
    )
}

function ErrorBanner({ message, onRetry }) {
    return (
        <div style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center',
            gap: 12, marginBottom: 24
        }}>
            <AlertCircle size={18} color="#ef4444" />
            <div style={{ flex: 1 }}>
                <div style={{ color: '#ef4444', fontWeight: 600, fontSize: 14 }}>Could not load rotation data</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 }}>{message}</div>
            </div>
            {onRetry && (
                <button onClick={onRetry} style={{
                    background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 8, padding: '6px 14px', color: '#ef4444',
                    fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                }}>
                    <RefreshCw size={12} /> Retry
                </button>
            )}
        </div>
    )
}

function CoverCropCard({ crop }) {
    const [expanded, setExpanded] = useState(false)
    return (
        <motion.div
            layout
            className="card"
            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
            onClick={() => setExpanded(e => !e)}
            whileHover={{ y: -2 }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: 'rgba(34,197,94,0.12)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Sprout size={16} color="#22c55e" />
                        </div>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#f0fdf4' }}>{crop.name}</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{crop.family}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, color: '#22c55e' }}>🌿 N-fix: {crop.nFixation}</span>
                        <span style={{ fontSize: 11, color: '#38bdf8' }}>📅 {crop.plantingWindow}</span>
                    </div>
                </div>
                {expanded ? <ChevronUp size={16} color="rgba(255,255,255,0.4)" /> : <ChevronDown size={16} color="rgba(255,255,255,0.4)" />}
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: 'hidden', marginTop: 16 }}
                    >
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14 }}>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Benefits</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                                {crop.benefits.map(b => (
                                    <span key={b} style={{
                                        fontSize: 11, background: 'rgba(34,197,94,0.08)',
                                        border: '1px solid rgba(34,197,94,0.15)', borderRadius: 6,
                                        padding: '3px 8px', color: '#86efac'
                                    }}>{b}</span>
                                ))}
                            </div>
                            <div style={{
                                background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.12)',
                                borderRadius: 8, padding: '10px 12px'
                            }}>
                                <div style={{ fontSize: 11, color: '#38bdf8', marginBottom: 3, fontWeight: 600 }}>
                                    🌍 BRICS Context
                                </div>
                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{crop.bricsNote}</div>
                            </div>
                            <div style={{ marginTop: 10, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                                Best after: {crop.bestAfter.join(', ')}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

function RotationFieldCard({ suggestion }) {
    const [expanded, setExpanded] = useState(true)
    return (
        <motion.div
            layout
            className="card"
            style={{ marginBottom: 20 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Header */}
            <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: expanded ? 20 : 0 }}
                onClick={() => setExpanded(e => !e)}
            >
                <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#f0fdf4' }}>{suggestion.field}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                        Last grown: <span style={{ color: '#86efac' }}>{suggestion.lastCrop}</span>
                        {suggestion.cropHistory.length > 1 && ` → ${suggestion.cropHistory.slice(1).join(' → ')}`}
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        fontSize: 11, background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.15)', borderRadius: 6,
                        padding: '3px 10px', color: '#fca5a5'
                    }}>
                        Avoid: {suggestion.avoidCrops.slice(0, 2).join(', ')}
                    </div>
                    {expanded ? <ChevronUp size={16} color="rgba(255,255,255,0.4)" /> : <ChevronDown size={16} color="rgba(255,255,255,0.4)" />}
                </div>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: 'hidden' }}
                    >
                        {/* Agronomic note */}
                        {suggestion.agronomicNote && (
                            <div style={{
                                background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
                                borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12,
                                color: 'rgba(255,255,255,0.6)', display: 'flex', gap: 10, alignItems: 'flex-start'
                            }}>
                                <Info size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
                                {suggestion.agronomicNote}
                            </div>
                        )}

                        {/* Recommended crops */}
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 10, fontWeight: 600, letterSpacing: '0.5px' }}>
                                RECOMMENDED NEXT CROPS
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {suggestion.recommendations.map((rec, i) => (
                                    <motion.div
                                        key={rec.crop}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.08 }}
                                        style={{
                                            background: 'rgba(255,255,255,0.03)',
                                            border: `1px solid rgba(255,255,255,0.06)`,
                                            borderRadius: 10, padding: '12px 14px',
                                            display: 'flex', alignItems: 'flex-start', gap: 12
                                        }}
                                    >
                                        <div style={{
                                            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                                            background: `rgba(${i === 0 ? '34,197,94' : i === 1 ? '56,189,248' : '167,139,250'},0.12)`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 14, fontWeight: 800,
                                            color: i === 0 ? '#22c55e' : i === 1 ? '#38bdf8' : '#a78bfa'
                                        }}>
                                            {i + 1}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                                <div style={{ fontSize: 14, fontWeight: 700, color: '#f0fdf4' }}>{rec.crop}</div>
                                                <div style={{
                                                    fontSize: 12, fontWeight: 700,
                                                    color: confidenceColor(rec.confidence)
                                                }}>
                                                    {rec.confidence}% match
                                                </div>
                                            </div>
                                            {/* Confidence bar */}
                                            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 100, marginBottom: 6, overflow: 'hidden' }}>
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${rec.confidence}%` }}
                                                    transition={{ duration: 0.8, delay: i * 0.1 }}
                                                    style={{ height: '100%', background: confidenceColor(rec.confidence), borderRadius: 100 }}
                                                />
                                            </div>
                                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{rec.reason}</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Rest period + cover crops */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div style={{
                                background: 'rgba(56,189,248,0.06)', borderRadius: 8,
                                padding: '10px 14px', fontSize: 12
                            }}>
                                <div style={{ color: '#38bdf8', fontWeight: 600, marginBottom: 4 }}>
                                    ⏱ Rest / Transition
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.6)' }}>{suggestion.restPeriod}</div>
                            </div>
                            <div style={{
                                background: 'rgba(34,197,94,0.06)', borderRadius: 8,
                                padding: '10px 14px', fontSize: 12
                            }}>
                                <div style={{ color: '#22c55e', fontWeight: 600, marginBottom: 4 }}>
                                    🌿 Cover Crops
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.6)' }}>
                                    {suggestion.suggestedCoverCrops.slice(0, 2).join(', ')}
                                </div>
                            </div>
                        </div>

                        {/* BRICS context */}
                        <div style={{
                            marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.35)',
                            display: 'flex', alignItems: 'center', gap: 6
                        }}>
                            <Globe size={12} />
                            {suggestion.bricsContext}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default function RegenAg() {
    const [activeTab, setActiveTab] = useState('rotation')
    const { data, loading, error, refetch } = useApi('/api/regen/rotation')
    const { data: coverCropData, loading: ccLoading } = useApi('/api/regen/cover-crops')

    const noHistory = data && data.suggestions?.length === 0

    return (
        <div style={{ padding: 28 }} className="page-enter">
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(56,189,248,0.2))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid rgba(34,197,94,0.2)'
                    }}>
                        <RotateCcw size={22} color="#22c55e" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f0fdf4', letterSpacing: '-0.5px' }}>
                            Regenerative Agriculture
                        </h1>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                            Smart crop rotation & cover crop engine — powered by your farm history
                        </div>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6,
                        background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.15)',
                        borderRadius: 20, padding: '6px 14px', fontSize: 12, color: '#38bdf8'
                    }}>
                        <Globe size={13} />
                        BRICS AgriN Track
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
                {[
                    { id: 'rotation', label: 'Crop Rotation', icon: RotateCcw },
                    { id: 'cover', label: 'Cover Crops', icon: Sprout },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
                            background: activeTab === tab.id ? 'rgba(34,197,94,0.12)' : 'transparent',
                            color: activeTab === tab.id ? '#22c55e' : 'rgba(255,255,255,0.5)',
                            fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400,
                            transition: 'all 0.2s'
                        }}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Rotation Tab */}
            {activeTab === 'rotation' && (
                <div>
                    {loading && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 8 }}>
                                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                Loading your crop rotation analysis...
                            </div>
                            {[0, 1].map(i => <SkeletonCard key={i} />)}
                        </div>
                    )}

                    {error && <ErrorBanner message={error} onRetry={refetch} />}

                    {!loading && !error && noHistory && (
                        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>🌱</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: '#f0fdf4', marginBottom: 8 }}>
                                No Crop History Found
                            </div>
                            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', maxWidth: 400, margin: '0 auto 20px' }}>
                                Add your crop records in Farm Records page to get personalized rotation suggestions.
                            </div>
                            <a href="/app/records" style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)',
                                borderRadius: 10, padding: '10px 20px', color: '#22c55e', textDecoration: 'none',
                                fontSize: 14, fontWeight: 600
                            }}>
                                Go to Farm Records <ArrowRight size={14} />
                            </a>
                        </div>
                    )}

                    {!loading && !error && data?.suggestions?.length > 0 && (
                        <div>
                            {/* Summary bar */}
                            <div style={{
                                display: 'flex', gap: 16, marginBottom: 24,
                                background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.1)',
                                borderRadius: 12, padding: '14px 20px'
                            }}>
                                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                                    📋 Analyzed <strong style={{ color: '#22c55e' }}>{data.totalFields}</strong> field{data.totalFields !== 1 ? 's' : ''}
                                </div>
                                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>•</div>
                                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                                    ♻️ {data.principle}
                                </div>
                            </div>

                            {data.suggestions.map((s, i) => (
                                <RotationFieldCard key={i} suggestion={s} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Cover Crops Tab */}
            {activeTab === 'cover' && (
                <div>
                    {ccLoading ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            {[0, 1, 2, 3].map(i => <SkeletonCard key={i} />)}
                        </div>
                    ) : (
                        <>
                            <div style={{
                                background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)',
                                borderRadius: 12, padding: '14px 20px', marginBottom: 24, fontSize: 13,
                                color: 'rgba(255,255,255,0.5)'
                            }}>
                                🌿 {coverCropData?.principle}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                {(coverCropData?.coverCrops || []).map((crop, i) => (
                                    <CoverCropCard key={i} crop={crop} />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
