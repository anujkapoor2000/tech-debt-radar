export default function Nav({ tabs, activeTab, onTabChange }) {
  return (
    <nav style={{
      background: 'var(--navy)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      alignItems: 'center',
      height: 54,
      padding: '0 20px',
      gap: 0,
      flexShrink: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 28 }}>
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: 'var(--blue)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 700, color: 'white', fontFamily: 'var(--font-mono)',
        }}>NTT</div>
        <span style={{ color: 'white', fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px' }}>
          NTT DATA
        </span>
        <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.15)' }} />
        <span style={{ color: 'var(--lblue)', fontWeight: 600, fontSize: 14 }}>
          Tech Debt Radar
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, flex: 1 }}>
        {tabs.map(tab => {
          const active = tab.id === activeTab
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
                border: 'none',
                borderBottom: active ? '2px solid var(--lblue)' : '2px solid transparent',
                color: active ? 'white' : 'var(--mgray)',
                padding: '0 14px',
                height: 54,
                cursor: 'pointer',
                fontSize: 12.5,
                fontWeight: active ? 600 : 400,
                fontFamily: 'var(--font-sans)',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                letterSpacing: '-0.1px',
              }}
              onMouseEnter={e => { if (!active) e.target.style.color = 'rgba(255,255,255,0.8)' }}
              onMouseLeave={e => { if (!active) e.target.style.color = 'var(--mgray)' }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Right badge */}
      <div style={{
        background: 'rgba(255,107,0,0.15)',
        border: '1px solid rgba(255,107,0,0.35)',
        borderRadius: 20,
        padding: '4px 12px',
        fontSize: 11.5,
        color: '#FFA050',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <span style={{ fontSize: 13 }}>🔥</span>
        Guidewire Practice
      </div>
    </nav>
  )
}
