import { useState } from 'react'
import { createPortal } from 'react-dom'
import { MapContainer, TileLayer, Polygon, Marker, useMapEvents } from 'react-leaflet'
import { X, MapPin, RotateCcw, Check, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { API_BASE } from '../hooks/useApi'
import 'leaflet/dist/leaflet.css'

const DEFAULT_CENTER = [18.52, 73.85] // Pune, India — used only as an initial map view

function ClickCatcher({ onClick }) {
    useMapEvents({ click: (e) => onClick([e.latlng.lat, e.latlng.lng]) })
    return null
}

function centroidOf(points) {
    const n = points.length
    const [sumLat, sumLon] = points.reduce(([la, lo], [lat, lon]) => [la + lat, lo + lon], [0, 0])
    return [sumLat / n, sumLon / n]
}

export default function FarmPolygonDrawer({ onSaved, onClose }) {
    const [points, setPoints] = useState([])
    const [fieldName, setFieldName] = useState('')
    const [saving, setSaving] = useState(false)

    const addPoint = (latlng) => setPoints(p => [...p, latlng])
    const undo = () => setPoints(p => p.slice(0, -1))
    const reset = () => setPoints([])

    const handleSave = async () => {
        if (!fieldName.trim()) return toast.error('Give your field a name')
        if (points.length < 3) return toast.error('Add at least 3 points to draw a field boundary')

        setSaving(true)
        try {
            const [lat, lon] = centroidOf(points)
            const geojson = {
                type: 'Polygon',
                coordinates: [[...points.map(([la, lo]) => [lo, la]), [points[0][1], points[0][0]]]],
            }

            const token = localStorage.getItem('agromind_token')
            const res = await fetch(`${API_BASE}/api/ndvi/polygon`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ fieldName: fieldName.trim(), geojson, lat, lon }),
            })
            const json = await res.json()
            if (!res.ok) {
                toast.error(json.error || 'Could not save field boundary')
                return
            }
            toast.success(json.message || 'Field boundary saved')
            onSaved?.({ id: json.id, fieldName: fieldName.trim(), lat, lon })
        } catch {
            toast.error('Cannot reach backend server. Make sure it is running on port 5050.')
        } finally {
            setSaving(false)
        }
    }

    return createPortal(
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
            <div style={{
                background: '#111a11', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16,
                width: 'min(720px, 100%)', maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <MapPin size={18} color="#22c55e" /> Draw Your Field Boundary
                        </div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                            Click on the map to add corner points. Needed once to unlock live crop health & soil data.
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ height: 360 }}>
                    <MapContainer center={DEFAULT_CENTER} zoom={14} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="&copy; OpenStreetMap contributors"
                        />
                        <ClickCatcher onClick={addPoint} />
                        {points.map((p, i) => <Marker key={i} position={p} />)}
                        {points.length >= 3 && <Polygon positions={points} pathOptions={{ color: '#22c55e', fillOpacity: 0.2 }} />}
                    </MapContainer>
                </div>

                <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input
                        value={fieldName}
                        onChange={e => setFieldName(e.target.value)}
                        placeholder="Field name (e.g. Field A — Wheat)"
                        style={{
                            padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)',
                            background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: 14,
                        }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{points.length} point{points.length !== 1 ? 's' : ''} placed</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={undo} disabled={!points.length} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8 }}>
                                <RotateCcw size={14} /> Undo
                            </button>
                            <button onClick={reset} disabled={!points.length} className="btn-secondary" style={{ padding: '8px 14px', borderRadius: 8 }}>
                                Clear
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving || points.length < 3}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8,
                                    background: '#22c55e', color: '#052e0f', fontWeight: 700, border: 'none',
                                    cursor: saving || points.length < 3 ? 'not-allowed' : 'pointer',
                                    opacity: saving || points.length < 3 ? 0.6 : 1,
                                }}
                            >
                                {saving ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
                                Save Field
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}
