export default function LiveBadge({ label = 'Live', color = '#22c55e' }) {
    return (
        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 100,
            background: `${color}26`, border: `1px solid ${color}40`,
            fontSize: 11, fontWeight: 700, color, letterSpacing: '0.02em',
        }}>
            <span style={{ position: 'relative', width: 7, height: 7, display: 'inline-flex' }}>
                <span style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    background: color, animation: 'live-badge-ping 1.6s cubic-bezier(0,0,0.2,1) infinite',
                }} />
                <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color }} />
            </span>
            {label}
            <style>{`
                @keyframes live-badge-ping {
                    0% { transform: scale(1); opacity: 0.7; }
                    75%, 100% { transform: scale(2.4); opacity: 0; }
                }
            `}</style>
        </div>
    )
}
