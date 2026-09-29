import { useState, useRef } from 'react'
import { Upload, Bug, Loader, CheckCircle, AlertTriangle, X, Camera, RefreshCcw, Leaf, AlertCircle, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { postMultipart } from '../../hooks/useApi'

const diseases = [
    {
        name: 'Wheat Leaf Rust',
        confidence: 92,
        severity: 'Moderate',
        color: '#f59e0b',
        badge: 'badge-amber',
        description: 'Puccinia triticina — a fungal disease characterized by orange-brown pustules on leaf surfaces.',
        symptoms: [
            'Orange-yellow pustules on upper leaf surface',
            'Pustules surrounded by yellow halo',
            'Premature leaf drying',
            'Reduced grain fill',
        ],
        treatments: [
            { type: 'Fungicide', action: 'Apply Propiconazole 25EC @1 mL/L or Mancozeb 75WP @2 g/L water', urgency: 'Immediate' },
            { type: 'Cultural', action: 'Remove and destroy infected plant debris', urgency: 'This week' },
            { type: 'Prevention', action: 'Use resistant varieties (HD-3086, K-9107) in next season', urgency: 'Long-term' },
            { type: 'Monitoring', action: 'Inspect field every 5-7 days; spray again if >5% disease incidence', urgency: 'Ongoing' },
        ],
        alternates: [
            { name: 'Powdery Mildew', confidence: 6 },
            { name: 'Tan Spot', confidence: 2 },
        ]
    }
]

const ConfidenceBar = ({ value, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 100, transition: 'width 1s ease' }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color, flexShrink: 0 }}>{value}%</span>
    </div>
)

export default function DiseaseDetection() {
    const [dragOver, setDragOver] = useState(false)
    const [images, setImages] = useState([])
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [apiError, setApiError] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)
    const [currentFile, setCurrentFile] = useState(null)
    const fileRef = useRef()

    const handleFile = (file) => {
        if (!file?.type.startsWith('image/')) {
            toast.error('Please upload an image file (JPG, PNG, WEBP)')
            return
        }
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
        setCurrentFile(file)
        setResult(null)
        setApiError(null)
    }

    const runAnalysis = async () => {
        if (!currentFile) return
        setLoading(true)
        setApiError(null)
        setResult(null)

        const formData = new FormData()
        formData.append('image', currentFile)

        const { data, error } = await postMultipart('/api/disease/analyze', formData)
        setLoading(false)

        if (error) {
            setApiError(error)
            toast.error('Disease analysis failed')
            return
        }

        // Transform Plant.id response → existing result shape
        const topDisease = data.diseases?.[0]
        if (!topDisease && data.isHealthy) {
            setResult({ isHealthy: true, diseases: [], plant: data.plant, source: data.source })
            setImages(prev => [{ name: currentFile.name, size: `${(currentFile.size / (1024*1024)).toFixed(1)} MB`, status: 'analyzed', badge: 'Healthy' }, ...prev.slice(0, 4)])
            toast.success('🌿 Plant appears healthy!')
            return
        }
        if (!topDisease) {
            setApiError('No disease information returned from the API. Try a clearer, close-up leaf photo.')
            return
        }

        // Map Plant.id structure to result the existing UI uses
        const mapped = {
            name: topDisease.name,
            confidence: topDisease.probability,
            severity: topDisease.probability > 75 ? 'High' : topDisease.probability > 45 ? 'Moderate' : 'Low',
            color: topDisease.probability > 75 ? '#ef4444' : topDisease.probability > 45 ? '#f59e0b' : '#22c55e',
            description: topDisease.description || 'No description available from Plant.id for this condition.',
            symptoms: topDisease.cause ? [topDisease.cause] : ['See description above'],
            treatments: (() => {
                const t = topDisease.treatment || {}
                const steps = []
                if (t.chemical) steps.push({ type: 'Chemical', action: Array.isArray(t.chemical) ? t.chemical.join('; ') : t.chemical, urgency: 'Immediate' })
                if (t.biological) steps.push({ type: 'Biological', action: Array.isArray(t.biological) ? t.biological.join('; ') : t.biological, urgency: 'This week' })
                if (t.prevention) steps.push({ type: 'Prevention', action: Array.isArray(t.prevention) ? t.prevention.join('; ') : t.prevention, urgency: 'Long-term' })
                if (steps.length === 0) steps.push({ type: 'General', action: 'Consult a local agronomist for specific treatment recommendations.', urgency: 'This week' })
                return steps
            })(),
            alternates: (data.diseases || []).slice(1, 4).map(d => ({ name: d.name, confidence: d.probability })),
            plant: data.plant,
            isHealthy: data.isHealthy,
            source: data.source,
        }
        setResult(mapped)
        setImages(prev => [{ name: currentFile.name, size: `${(currentFile.size / (1024*1024)).toFixed(1)} MB`, status: 'analyzed', badge: mapped.name }, ...prev.slice(0, 4)])
        toast.success(`🔬 Analysis complete: ${mapped.name} detected`)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragOver(false)
        handleFile(e.dataTransfer.files[0])
    }

    return (
        <div style={{ padding: 28 }} className="page-enter">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* LEFT: Upload + History */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Upload */}
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                            <div style={{
                                width: 44, height: 44,
                                background: 'rgba(245,158,11,0.1)',
                                borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Bug size={20} color="#f59e0b" />
                            </div>
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Upload Plant Image</div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>AI analyzes leaves, stems, and fruit for disease</div>
                            </div>
                        </div>

                        <div
                            className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                            onDrop={handleDrop}
                            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                            onDragLeave={() => setDragOver(false)}
                            onClick={() => fileRef.current?.click()}
                        >
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={e => handleFile(e.target.files[0])}
                            />
                            {previewUrl ? (
                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        style={{ maxHeight: 180, borderRadius: 12, objectFit: 'contain' }}
                                    />
                                    <button
                                        onClick={e => { e.stopPropagation(); setPreviewUrl(null); setResult(null) }}
                                        style={{
                                            position: 'absolute', top: -8, right: -8,
                                            background: '#ef4444', border: 'none', borderRadius: '50%',
                                            width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer', color: 'white',
                                        }}
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div style={{ fontSize: 48, marginBottom: 12 }}>🔬</div>
                                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                                        Drop plant image here
                                    </div>
                                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                                        Supports JPG, PNG, WEBP — up to 10MB
                                    </div>
                                    <button className="btn btn-secondary btn-sm" style={{ pointerEvents: 'none' }}>
                                        <Upload size={14} /> Browse Files
                                    </button>
                                </>
                            )}
                        </div>

                        {previewUrl && !loading && !result && !apiError && (
                            <button
                                className="btn btn-primary"
                                style={{ width: '100%', marginTop: 16, justifyContent: 'center', height: 44 }}
                                onClick={runAnalysis}
                            >
                                <Bug size={16} /> Analyze for Disease (Plant.id)
                            </button>
                        )}

                        {loading && (
                            <div style={{
                                marginTop: 16, padding: '20px', textAlign: 'center',
                                background: 'rgba(245,158,11,0.05)', borderRadius: 12,
                                border: '1px solid rgba(245,158,11,0.15)',
                            }}>
                                <Loader size={24} className="animate-spin" style={{ color: '#f59e0b', margin: '0 auto 12px' }} />
                                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>AI is analyzing your plant...</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Scanning 50,000+ disease patterns</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16, textAlign: 'left' }}>
                                    {['Preprocessing image', 'Running CNN disease model', 'Cross-referencing symptom database', 'Generating treatment plan'].map((s, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                                            <Loader size={11} className="animate-spin" style={{ color: '#f59e0b' }} />
                                            {s}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tips */}
                        <div style={{ marginTop: 20 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12 }}>
                                📸 Photo Tips for Best Results
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {[
                                    'Take close-up photos of affected leaves',
                                    'Ensure good natural lighting — avoid shadows',
                                    'Include both healthy and diseased parts',
                                    'Capture multiple angles if possible',
                                ].map((tip, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                                        <Camera size={12} style={{ flexShrink: 0, marginTop: 2, color: '#f59e0b' }} />
                                        {tip}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* History */}
                    <div className="card">
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Recent Scans</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Your uploaded photos & analysis history</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {images.length === 0 && (
                                <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '8px 0' }}>
                                    No scans yet — upload a plant photo to get started.
                                </div>
                            )}
                            {images.map((img, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                                    background: 'rgba(255,255,255,0.02)', borderRadius: 10,
                                    border: '1px solid var(--border-subtle)',
                                }}>
                                    <div style={{
                                        width: 40, height: 40, background: 'rgba(245,158,11,0.1)',
                                        borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 18, flexShrink: 0,
                                    }}>
                                        🌿
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {img.name}
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{img.size}</div>
                                    </div>
                                    {img.status === 'analyzed' ? (
                                        <span className={`badge ${img.badge === 'Healthy' ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: 11, flexShrink: 0 }}>
                                            {img.badge}
                                        </span>
                                    ) : (
                                        <Loader size={14} className="animate-spin" style={{ color: '#f59e0b', flexShrink: 0 }} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Results */}
                <div>
                    {/* API Error Banner */}
                    {apiError && (
                        <div style={{
                            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: 12, padding: '16px 20px', marginBottom: 20,
                            display: 'flex', alignItems: 'flex-start', gap: 12
                        }}>
                            <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ color: '#ef4444', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Analysis Failed</div>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{apiError}</div>
                                {apiError.includes('not configured') && (
                                    <div style={{ marginTop: 8, fontSize: 12 }}>
                                        <a href="https://web.plant.id" target="_blank" rel="noopener noreferrer"
                                            style={{ color: '#38bdf8', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                            Get free Plant.id API key <ExternalLink size={11} />
                                        </a>
                                        <span style={{ color: 'rgba(255,255,255,0.3)', margin: '0 6px' }}>·</span>
                                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>Add to backend/.env as PLANT_ID_API_KEY</span>
                                    </div>
                                )}
                            </div>
                            <button onClick={() => setApiError(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                                <X size={14} />
                            </button>
                        </div>
                    )}
                    {!result && !loading && (
                        <div style={{
                            height: '100%', display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-lg)', padding: 48, textAlign: 'center', minHeight: 400,
                        }}>
                            <div style={{ fontSize: 56, marginBottom: 20 }} className="animate-float">🔬</div>
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                                Disease Detection Ready
                            </h3>
                            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 280 }}>
                                Upload a plant photo and our AI will identify diseases with treatment recommendations in seconds.
                            </p>
                            <div style={{ display: 'flex', gap: 8, marginTop: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
                                {['Leaf diseases', 'Root rot', 'Fungal infections', 'Viral symptoms', 'Nutrient deficiency'].map((t, i) => (
                                    <span key={i} className="badge badge-amber" style={{ fontSize: 11 }}>{t}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {result && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="animate-fade-in">
                            {/* Main Result */}
                            <div className="card" style={{
                                border: '1px solid rgba(245,158,11,0.3)',
                                background: 'linear-gradient(135deg, rgba(245,158,11,0.06), transparent)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                            <AlertTriangle size={18} color="#f59e0b" />
                                            <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                                                {result.name}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{result.description}</p>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                                        <span className="badge badge-amber">Severity: {result.severity}</span>
                                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>AI Confidence</span>
                                        <span style={{ fontSize: 20, fontWeight: 800, color: '#f59e0b' }}>{result.confidence}%</span>
                                    </div>
                                </div>

                                {/* Alt detections */}
                                <div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>OTHER POSSIBLE DISEASES</div>
                                    {result.alternates.map((alt, i) => (
                                        <div key={i} style={{ marginBottom: 8 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{alt.name}</span>
                                            </div>
                                            <ConfidenceBar value={alt.confidence} color="#6b7280" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Symptoms */}
                            <div className="card">
                                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                                    Identified Symptoms
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {result.symptoms.map((s, i) => (
                                        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                            <div style={{
                                                width: 18, height: 18, borderRadius: '50%',
                                                background: 'rgba(245,158,11,0.15)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                flexShrink: 0, marginTop: 1,
                                            }}>
                                                <span style={{ fontSize: 10, color: '#f59e0b', fontWeight: 700 }}>{i + 1}</span>
                                            </div>
                                            <span style={{ fontSize: 13, color: 'var(--gray-300)', lineHeight: 1.5 }}>{s}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Treatments */}
                            <div className="card">
                                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                                    Treatment Plan
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {result.treatments.map((t, i) => (
                                        <div key={i} style={{
                                            padding: '12px 14px',
                                            background: 'rgba(255,255,255,0.02)',
                                            borderRadius: 10,
                                            border: '1px solid var(--border-subtle)',
                                            borderLeft: `3px solid ${t.urgency === 'Immediate' ? '#ef4444' : t.urgency === 'This week' ? '#f59e0b' : t.urgency === 'Long-term' ? '#22c55e' : '#6b7280'}`,
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t.type}</span>
                                                <span className={`badge ${t.urgency === 'Immediate' ? 'badge-red' : t.urgency === 'This week' ? 'badge-amber' : 'badge-green'}`} style={{ fontSize: 10 }}>
                                                    {t.urgency}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: 13, color: 'var(--gray-300)', lineHeight: 1.5 }}>{t.action}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}
                                    onClick={() => {
                                        const report = `DISEASE DETECTION REPORT\n\nDisease: ${result.name}\nConfidence: ${result.confidence}%\nSeverity: ${result.severity}\n\nSymptoms:\n${result.symptoms.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nTreatment Plan:\n${result.treatments.map(t => `[${t.type}] ${t.action} (${t.urgency})`).join('\n')}`
                                        const blob = new Blob([report], { type: 'text/plain' })
                                        const link = document.createElement('a')
                                        link.href = URL.createObjectURL(blob)
                                        link.download = `disease-report-${result.name.replace(/ /g, '-')}.txt`
                                        document.body.appendChild(link)
                                        link.click()
                                        document.body.removeChild(link)
                                        toast.success('📄 Disease report saved!')
                                    }}>
                                    <CheckCircle size={14} /> Save Report
                                </button>
                                <button className="btn btn-ghost" onClick={() => { setResult(null); setPreviewUrl(null) }}
                                    style={{ flex: 1, justifyContent: 'center' }}>
                                    <RefreshCcw size={14} /> Scan New Image
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
