const TABS = [
  { id: 'trip',     label: 'Trip',     icon: '🏍️' },
  { id: 'route',    label: 'Route',    icon: '🗺️' },
  { id: 'packing',  label: 'Packing',  icon: '🎒' },
  { id: 'money',    label: 'Money',    icon: '💶' },
  { id: 'info',     label: 'Info',     icon: '🛂' },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav style={{
      display: 'flex',
      background: 'var(--surface)',
      borderTop: '1px solid var(--border)',
      minHeight: 'var(--nav-h)',
      paddingBottom: 'env(safe-area-inset-bottom)',
      flexShrink: 0,
    }}>
      {TABS.map(t => {
        const isActive = t.id === active
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              color: isActive ? 'var(--blue)' : 'var(--text-muted)',
              transition: 'color 0.15s',
              position: 'relative',
            }}
          >
            {isActive && (
              <span style={{
                position: 'absolute',
                top: 0, left: '15%', right: '15%', height: 2,
                background: 'var(--blue)',
                borderRadius: '0 0 2px 2px',
              }} />
            )}
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500 }}>{t.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
