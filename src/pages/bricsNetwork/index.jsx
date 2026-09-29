import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Globe, BarChart2, AlertCircle, RefreshCw, Droplets, Leaf,
    TrendingUp, Info, Loader2, Users, CheckCircle2, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, RadarChart, PolarGrid,
    PolarAngleAxis, Radar, Legend
} from 'recharts'
import { useApi } from '../../hooks/useApi'
import toast from 'react-hot-toast'

// Color map per BRICS region
const REGION_COLORS = {
    'Brazil-Cerrado':       '#22c55e',
    'Russia-Volga':         '#38bdf8',
    'China-Yangtze':        '#f59e0b',
    'South-Africa-Limpopo': '#a78bfa',
    'India-Punjab':         '#fb923c',
    'India-Deccan':         '#34d399',
    'India-North':          '#fb923c',
    'India-South':          '#34d399',
}
const DEFAULT_COLOR = '#6b7280'
const getColor = (region) => REGION_COLORS[region] || DEFAULT_COLOR

const riskBadge = {
    Low:    { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.2)' },
    Medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
    High:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.2)' },
}

function ErrorBanner({ message, onRetry }) {
    return (
        <div style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24
        }}>
            <AlertCircle size={18} color="#ef4444" />
            <div style={{ flex: 1 }}>
                <div style={{ color: '#ef4444', fontWeight: 600, fontSize: 14 }}>Failed to load BRICS network data</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{message}</div>
            </div>
            {onRetry && (
                <button onClick={onRetry} style={{
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 8, padding: '6px 14px', color: '#ef4444',
                    fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                }}>
                    <RefreshCw size={12} /> Retry
                </button>
            )}
        </div>
    )
}

function StatChip({ label, value, icon: Icon, color = '#22c55e' }) {
    return (
        <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12
        }}>
            <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: `rgba(${color === '#22c55e' ? '34,197,94' : color === '#38bdf8' ? '56,189,248' : '245,158,11'},0.12)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <Icon size={18} color={color} />
            </div>
            <div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#f0fdf4' }}>{value ?? '—'}</div>
            </div>
        </div>
    )
}

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{
            background: '#1a2e1a', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, padding: '10px 14px'
        }}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ fontSize: 13, color: p.fill || p.color, fontWeight: 600 }}>
                    {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
                </div>
            ))}
        </div>
    )
}

export default function BricsNetwork() {
    const [activeTab, setActiveTab] = useState('ndvi')
    const { data: networkData, loading, error, refetch } = useApi('/api/brics/network')
    const { data: compareData, loading: cmpLoading } = useApi('/api/brics/compare')

    const regions = networkData?.regions || []
    const network = networkData?.network || {}

    // Chart data
    const ndviChartData = useMemo(() =>
        regions
            .filter(r => r.ndviAvg != null)
            .map(r => ({ region: r.region.split('-')[0], fullRegion: r.region, ndvi: r.ndviAvg, isDemo: r.isDemo }))
    , [regions])

    const moistureChartData = useMemo(() =>
        regions
            .filter(r => r.soilMoisture != null)
            .map(r => ({ region: r.region.split('-')[0], fullRegion: r.region, moisture: r.soilMoisture, isDemo: r.isDemo }))
    , [regions])

    const radarData = useMemo(() =>
        regions.map(r => ({
            region: r.region.split('-')[0],
            NDVI: r.ndviAvg != null ? Math.round(r.ndviAvg * 100) : 0,
            Moisture: r.soilMoisture != null ? Math.round(r.soilMoisture) : 0,
            pH: r.soilPh != null ? Math.round(r.soilPh * 10) : 0,
        }))
    , [regions])

    return (
        <div style={{ padding: 28 }} className="page-enter">
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(167,139,250,0.2))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid rgba(56,189,248,0.2)'
                    }}>
                        <Globe size={22} color="#38bdf8" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f0fdf4', letterSpacing: '-0.5px' }}>
                            BRICS Network
                        </h1>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                            Aggregated crop health & soil intelligence across BRICS agricultural regions
                        </div>
                    </div>
                    <div style={{
                        marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6,
                        background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)',
                        borderRadius: 20, padding: '6px 14px', fontSize: 12, color: '#22c55e'
                    }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
                        Live + Demo Network
                    </div>
                </div>

                {/* Demo data notice */}
                <div style={{
                    background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)',
                    borderRadius: 10, padding: '10px 16px', fontSize: 12,
                    color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 8
                }}>
                    <Info size={13} color="#f59e0b" />
                    Regions labeled <strong style={{ color: '#f59e0b' }}>Demo</strong> use representative baseline data from FAO agricultural statistics. Real user farms update this data as members share their metrics.
                </div>
            </div>

            {error && <ErrorBanner message={error} onRetry={refetch} />}

            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.4)', padding: 40, justifyContent: 'center' }}>
                    <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                    Loading network data...
                </div>
            ) : (
                <>
                    {/* Summary stat chips */}
                    <div className="grid-4" style={{ marginBottom: 24 }}>
                        <StatChip label="Regions" value={network.totalRegions} icon={Globe} color="#38bdf8" />
                        <StatChip label="Global Avg NDVI" value={network.globalNdviAvg?.toFixed(3)} icon={Leaf} color="#22c55e" />
                        <StatChip label="Avg Soil Moisture" value={network.globalSoilMoistureAvg ? `${network.globalSoilMoistureAvg}%` : '—'} icon={Droplets} color="#38bdf8" />
                        <StatChip label="Participating Farms" value={regions.reduce((s, r) => s + r.dataPoints, 0)} icon={Users} color="#f59e0b" />
                    </div>

                    {/* Tab selector */}
                    <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
                        {[
                            { id: 'ndvi', label: 'NDVI / Crop Health' },
                            { id: 'moisture', label: 'Soil Moisture' },
                            { id: 'compare', label: 'My Farm vs Network' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                    background: activeTab === tab.id ? 'rgba(56,189,248,0.12)' : 'transparent',
                                    color: activeTab === tab.id ? '#38bdf8' : 'rgba(255,255,255,0.5)',
                                    fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400,
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* NDVI Chart */}
                    {activeTab === 'ndvi' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 24 }}>
                            <div className="card">
                                <div style={{ marginBottom: 20 }}>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: '#f0fdf4' }}>NDVI by Region</div>
                                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Average Normalized Difference Vegetation Index (0 = bare, 1 = dense vegetation)</div>
                                </div>
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={ndviChartData} margin={{ left: -20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="region" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <YAxis domain={[0, 1]} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="ndvi" name="NDVI" radius={[6, 6, 0, 0]}>
                                            {ndviChartData.map((d, i) => (
                                                <Cell key={i} fill={getColor(d.fullRegion)} fillOpacity={d.isDemo ? 0.6 : 1} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            {/* Region list */}
                            <div className="card">
                                <div style={{ fontSize: 14, fontWeight: 700, color: '#f0fdf4', marginBottom: 16 }}>Region Details</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', maxHeight: 280 }}>
                                    {regions.map((r, i) => (
                                        <div key={i} style={{
                                            display: 'flex', alignItems: 'center', gap: 10,
                                            padding: '10px 12px', background: 'rgba(255,255,255,0.03)',
                                            borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: getColor(r.region), flexShrink: 0 }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: '#f0fdf4' }}>{r.region}</div>
                                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                                                    {r.dominantCrop || '—'} · {r.dataPoints} data point{r.dataPoints !== 1 ? 's' : ''}
                                                    {r.isDemo && <span style={{ color: '#f59e0b' }}> · Demo</span>}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: 14, fontWeight: 700, color: r.ndviAvg > 0.65 ? '#22c55e' : r.ndviAvg > 0.45 ? '#f59e0b' : '#ef4444' }}>
                                                    {r.ndviAvg?.toFixed(2) ?? '—'}
                                                </div>
                                                {r.weatherRisk && (
                                                    <div style={{
                                                        fontSize: 10, color: (riskBadge[r.weatherRisk] || riskBadge.Low).color
                                                    }}>{r.weatherRisk} risk</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Soil Moisture Chart */}
                    {activeTab === 'moisture' && (
                        <div className="card">
                            <div style={{ marginBottom: 20 }}>
                                <div style={{ fontSize: 16, fontWeight: 700, color: '#f0fdf4' }}>Soil Moisture by Region</div>
                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Average soil moisture % — optimal range: 30–70%</div>
                            </div>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={moistureChartData} margin={{ left: -20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="region" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="moisture" name="Soil Moisture %" radius={[6, 6, 0, 0]}>
                                        {moistureChartData.map((d, i) => (
                                            <Cell key={i} fill={getColor(d.fullRegion)} fillOpacity={d.isDemo ? 0.6 : 1} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* My Farm vs Network */}
                    {activeTab === 'compare' && (
                        <div>
                            {cmpLoading ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.4)', padding: 40, justifyContent: 'center' }}>
                                    <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                                    Loading comparison...
                                </div>
                            ) : !compareData?.userFarm ? (
                                <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
                                    <div style={{ fontSize: 40, marginBottom: 14 }}>🌍</div>
                                    <div style={{ fontSize: 18, fontWeight: 700, color: '#f0fdf4', marginBottom: 8 }}>
                                        Contribute Your Farm Data
                                    </div>
                                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', maxWidth: 400, margin: '0 auto 20px' }}>
                                        Save your NDVI and soil metrics to see how your farm compares to the BRICS network average.
                                    </div>
                                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
                                        POST /api/brics/snapshot with your farm metrics
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                    {/* Your Farm */}
                                    <div className="card">
                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#f0fdf4', marginBottom: 16 }}>📍 Your Farm</div>
                                        {[
                                            { label: 'Region', value: compareData.userFarm.region },
                                            { label: 'Dominant Crop', value: compareData.userFarm.dominantCrop || '—' },
                                            { label: 'NDVI', value: compareData.userFarm.ndviAvg?.toFixed(3) || '—' },
                                            { label: 'Soil Moisture', value: compareData.userFarm.soilMoisture ? `${compareData.userFarm.soilMoisture}%` : '—' },
                                            { label: 'Soil pH', value: compareData.userFarm.soilPh || '—' },
                                            { label: 'Weather Risk', value: compareData.userFarm.weatherRisk || '—' },
                                        ].map((item, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{item.label}</span>
                                                <span style={{ fontSize: 13, fontWeight: 600, color: '#f0fdf4' }}>{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Comparison */}
                                    <div className="card">
                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#f0fdf4', marginBottom: 16 }}>🌍 vs Network Average</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                            {[
                                                {
                                                    label: 'NDVI',
                                                    yours: compareData.userFarm.ndviAvg?.toFixed(3),
                                                    network: compareData.networkAvg.ndvi?.toFixed(3),
                                                    delta: compareData.comparison.ndviVsNetwork,
                                                    status: compareData.comparison.ndviStatus,
                                                },
                                                {
                                                    label: 'Soil Moisture',
                                                    yours: compareData.userFarm.soilMoisture ? `${compareData.userFarm.soilMoisture}%` : '—',
                                                    network: compareData.networkAvg.soilMoisture ? `${compareData.networkAvg.soilMoisture}%` : '—',
                                                    delta: compareData.comparison.moistureVsNetwork,
                                                    status: compareData.comparison.moistureStatus,
                                                },
                                            ].map((item, i) => (
                                                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '12px 14px' }}>
                                                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>{item.label}</div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div>
                                                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>Your Farm</div>
                                                            <div style={{ fontSize: 18, fontWeight: 800, color: '#f0fdf4' }}>{item.yours ?? '—'}</div>
                                                        </div>
                                                        <div style={{ textAlign: 'center' }}>
                                                            {item.delta != null && (
                                                                <div style={{
                                                                    display: 'flex', alignItems: 'center', gap: 4,
                                                                    color: item.delta > 0 ? '#22c55e' : '#ef4444', fontSize: 13, fontWeight: 700
                                                                }}>
                                                                    {item.delta > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                                    {Math.abs(item.delta).toFixed(2)}
                                                                </div>
                                                            )}
                                                            <div style={{
                                                                fontSize: 11, marginTop: 2,
                                                                color: item.status === 'Above Average' ? '#22c55e' : item.status === 'Below Average' ? '#ef4444' : '#f59e0b'
                                                            }}>
                                                                {item.status || '—'}
                                                            </div>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>Network Avg</div>
                                                            <div style={{ fontSize: 18, fontWeight: 800, color: '#f0fdf4' }}>{item.network ?? '—'}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
                                                Network avg across {compareData.networkAvg.totalFarms} farms
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
