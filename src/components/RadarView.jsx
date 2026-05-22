import { useState, useEffect, useRef } from 'react'
import { DEBT_ITEMS, SEVERITY_META, CATEGORY_META, COMPONENT_COLORS } from '../data/debtData'

const SEV_COLORS = { critical: '#DC2626', high: '#D97706', medium: '#0072BC', low: '#00B753' }

function RadarCanvas({ items, onSelect, selected }) {
  const svgW = 620, svgH = 560
  const cx = 310, cy = 290, maxR = 240

  const rings = [0.25, 0.5, 0.75, 1.0]
  const ringLabels = ['Low Risk', 'Medium', 'High', 'Critical']

  // Map items to positions
  const blobs = items.map(item => {
    const rad = (item.angle * Math.PI) / 180
    const x = cx + maxR * item.distance * Math.cos(rad)
    const y = cy + maxR * item.distance * Math.sin(rad)
    // Size based on effort
    const size = Math.max(18, Math.min(46, item.effort * 3.2))
    return { ...item, svgX: x, svgY: y, size }
  })

  const [pulsePhase, setPulsePhase] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setPulsePhase(p => (p + 1) % 60), 60)
    return () => clearInterval(t)
  }, [])

  return (
    <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} style={{ display: 'block' }}>
      {/* Dark background */}
      <rect width={svgW} height={svgH} fill="#0A0F28" rx={12} />

      {/* Grid rings */}
      {rings.map((r, i) => (
        <circle key={r} cx={cx} cy={cy} r={maxR * r}
          fill={r === 1.0 ? 'rgba(220,38,38,0.04)' : 'none'}
          stroke={r === 1.0 ? 'rgba(220,38,38,0.25)' : 'rgba(100,130,200,0.15)'}
          strokeWidth={r === 1.0 ? 1.5 : 1}
          strokeDasharray={r < 1.0 ? '4 4' : 'none'}
        />
      ))}

      {/* Ring labels */}
      {rings.map((r, i) => (
        <text key={r} x={cx + maxR * r + 6} y={cy + 4}
          fill="rgba(130,155,200,0.6)" fontSize={9} fontFamily="DM Mono">
          {ringLabels[i]}
        </text>
      ))}

      {/* Cross-hair axes */}
      <line x1={cx} y1={20} x2={cx} y2={svgH - 20} stroke="rgba(100,130,200,0.15)" strokeWidth={1} />
      <line x1={20} y1={cy} x2={svgW - 20} y2={cy} stroke="rgba(100,130,200,0.15)" strokeWidth={1} />

      {/* Quadrant labels */}
      <text x={cx + 12} y={48} fill="rgba(200,60,60,0.5)" fontSize={9} fontFamily="DM Sans" fontWeight="700">HIGH RISK · HIGH EFFORT</text>
      <text x={34} y={48} fill="rgba(220,140,0,0.5)" fontSize={9} fontFamily="DM Sans" fontWeight="700">HIGH RISK · LOW EFFORT</text>
      <text x={34} y={svgH - 22} fill="rgba(0,130,80,0.5)" fontSize={9} fontFamily="DM Sans" fontWeight="700">LOW RISK · LOW EFFORT</text>
      <text x={cx + 12} y={svgH - 22} fill="rgba(0,100,180,0.5)" fontSize={9} fontFamily="DM Sans" fontWeight="700">LOW RISK · HIGH EFFORT</text>

      {/* Centre */}
      <circle cx={cx} cy={cy} r={8} fill="rgba(100,140,220,0.4)" />
      <text x={cx} y={cy + 3} fill="rgba(150,170,220,0.7)" fontSize={7} textAnchor="middle" fontFamily="DM Mono">GW</text>

      {/* Blobs */}
      {blobs.map((b, i) => {
        const isSelected = selected?.id === b.id
        const color = SEV_COLORS[b.severity]
        const pulsing = b.newThisWeek
        const pulseR = b.size + 10 + (pulsing ? Math.sin(pulsePhase * 0.2) * 6 : 0)

        return (
          <g key={b.id} style={{ cursor: 'pointer' }} onClick={() => onSelect(b)}
            className="blob-in"
            style={{ animationDelay: `${i * 0.08}s`, cursor: 'pointer' }}>

            {/* Pulse ring for new items */}
            {pulsing && (
              <circle cx={b.svgX} cy={b.svgY} r={pulseR}
                fill="none" stroke={color} strokeWidth={1.5}
                opacity={0.3 + Math.sin(pulsePhase * 0.2) * 0.2}
              />
            )}

            {/* Selection ring */}
            {isSelected && (
              <circle cx={b.svgX} cy={b.svgY} r={b.size + 6}
                fill="none" stroke="white" strokeWidth={2} opacity={0.8}
              />
            )}

            {/* Glow */}
            <circle cx={b.svgX} cy={b.svgY} r={b.size + 10}
              fill={color} opacity={0.12} />

            {/* Main circle */}
            <circle cx={b.svgX} cy={b.svgY} r={b.size}
              fill={color} opacity={0.9}
              stroke={isSelected ? 'white' : 'rgba(255,255,255,0.2)'}
              strokeWidth={isSelected ? 2 : 1}
            />

            {/* Count */}
            <text x={b.svgX} y={b.svgY + 5} textAnchor="middle"
              fill="white" fontSize={b.size > 28 ? 13 : 10}
              fontWeight="700" fontFamily="DM Mono">
              {DEBT_ITEMS.filter(d => d.component === b.component && d.category === b.category).length || ''}
            </text>

            {/* Component abbreviation */}
            <text x={b.svgX} y={b.svgY + b.size + 16} textAnchor="middle"
              fill="rgba(200,215,240,0.75)" fontSize={9} fontFamily="DM Sans" fontWeight="600">
              {b.component?.slice(0,3).toUpperCase()}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function RadarView({ onNavigate, onSelectItem }) {
  const [selected, setSelected] = useState(null)
  const [sevFilter, setSevFilter] = useState(['critical','high','medium','low'])
  const [compFilter, setCompFilter] = useState(['PolicyCenter','ClaimCenter','BillingCenter','Integration'])

  const toggleSev  = s => setSevFilter(f => f.includes(s) ? f.filter(x=>x!==s) : [...f,s])
  const toggleComp = c => setCompFilter(f => f.includes(c) ? f.filter(x=>x!==c) : [...f,c])

  const filtered = DEBT_ITEMS.filter(d =>
    sevFilter.includes(d.severity) && compFilter.includes(d.component)
  )

  const handleSelect = item => {
    setSelected(prev => prev?.id === item.id ? null : item)
    onSelectItem && onSelectItem(item)
  }

  return (
    <div style={{ height: 'calc(100vh - 54px)', display: 'flex', overflow: 'hidden', background: 'var(--offwht)' }}>
      {/* Left filters panel */}
      <div style={{
        width: 220, background: 'white', borderRight: '1px solid var(--lgray)',
        overflowY: 'auto', padding: '18px 16px', flexShrink: 0,
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--mgray)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 }}>Filters</p>

        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>Severity</p>
        {['critical','high','medium','low'].map(s => {
          const m = SEVERITY_META[s]; const on = sevFilter.includes(s)
          return (
            <div key={s} onClick={() => toggleSev(s)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                borderRadius: 8, marginBottom: 5, cursor: 'pointer',
                background: on ? m.bg : 'transparent',
                border: `1px solid ${on ? m.border : 'transparent'}`,
                transition: 'all 0.15s',
              }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: on ? m.color : 'var(--lgray)', transition: 'all 0.15s' }} />
              <span style={{ fontSize: 12, fontWeight: on ? 600 : 400, color: on ? m.color : 'var(--mgray)' }}>{m.label}</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, fontFamily: 'var(--font-mono)', color: m.color }}>
                {DEBT_ITEMS.filter(d => d.severity === s).length}
              </span>
            </div>
          )
        })}

        <div style={{ height: 1, background: 'var(--lgray)', margin: '14px 0' }} />

        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>Component</p>
        {Object.entries(COMPONENT_COLORS).map(([comp, color]) => {
          const on = compFilter.includes(comp)
          return (
            <div key={comp} onClick={() => toggleComp(comp)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                borderRadius: 8, marginBottom: 5, cursor: 'pointer',
                background: on ? `${color}14` : 'transparent',
                border: `1px solid ${on ? `${color}30` : 'transparent'}`,
                transition: 'all 0.15s',
              }}>
              <div style={{ width: 3, height: 20, borderRadius: 2, background: on ? color : 'var(--lgray)', transition: 'all 0.15s' }} />
              <span style={{ fontSize: 12, fontWeight: on ? 600 : 400, color: on ? 'var(--navy)' : 'var(--mgray)' }}>{comp}</span>
            </div>
          )
        })}

        <div style={{ height: 1, background: 'var(--lgray)', margin: '14px 0' }} />

        <p style={{ fontSize: 10.5, color: 'var(--mgray)', lineHeight: 1.6 }}>
          ● <b>Size</b> = effort (SP)<br />
          ● <b>Colour</b> = severity<br />
          ● <b>Position</b> = risk zone<br />
          ● <b>Pulse</b> = new this week
        </p>
      </div>

      {/* Radar canvas */}
      <div style={{ flex: 1, padding: '20px', display: 'flex', gap: 16, overflow: 'hidden' }}>
        <div style={{
          flex: 1, background: '#0A0F28', borderRadius: 'var(--radius-lg)',
          overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <RadarCanvas items={filtered} onSelect={handleSelect} selected={selected} />
        </div>

        {/* Detail panel */}
        <div style={{
          width: 280, background: 'white', borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)', overflow: 'auto', flexShrink: 0,
        }}>
          {selected ? (
            <div>
              <div style={{ background: SEV_COLORS[selected.severity], padding: '16px 18px' }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>{selected.id}</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'white', lineHeight: 1.4 }}>{selected.title}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 6 }}>
                  {selected.component} · {selected.module}
                </div>
              </div>

              <div style={{ padding: '14px 18px' }}>
                {selected.file && (
                  <div style={{ background: 'var(--offwht)', borderRadius: 6, padding: '8px 12px', marginBottom: 12, fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>
                    📄 {selected.file}
                    {selected.lines > 0 && <span style={{ color: 'var(--red)', fontWeight: 600 }}> · {selected.lines} lines</span>}
                  </div>
                )}

                <p style={{ fontSize: 11.5, color: 'var(--mgray)', marginBottom: 12, fontWeight: 500 }}>AI Suggestion</p>
                <div style={{
                  background: 'rgba(0,114,188,0.06)', border: '1px solid rgba(0,114,188,0.2)',
                  borderRadius: 8, padding: '10px 12px', fontSize: 12, color: 'var(--dgray)', lineHeight: 1.5, marginBottom: 14,
                }}>
                  ✦ {selected.aiSuggestion}
                </div>

                {selected.breakdown && (
                  <>
                    <p style={{ fontSize: 11.5, color: 'var(--mgray)', marginBottom: 8, fontWeight: 500 }}>Breakdown</p>
                    {selected.breakdown.map(b => (
                      <div key={b.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: 'var(--dgray)' }}>{b.name}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: SEV_COLORS[selected.severity], fontFamily: 'var(--font-mono)' }}>
                          {b.count}
                        </span>
                      </div>
                    ))}
                  </>
                )}

                <div style={{ height: 1, background: 'var(--lgray)', margin: '14px 0' }} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                  {[['Effort', `${selected.effort} SP`], ['Sprint', selected.sprint], ['Status', selected.status], ['Category', CATEGORY_META[selected.category]?.label]].map(([l,v]) => (
                    <div key={l} style={{ background: 'var(--offwht)', borderRadius: 6, padding: '8px 10px' }}>
                      <div style={{ fontSize: 10, color: 'var(--mgray)', marginBottom: 2 }}>{l}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)' }}>{v}</div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onNavigate && onNavigate('remediation')}
                  style={{
                    width: '100%', background: 'var(--navy)', color: 'white', border: 'none',
                    borderRadius: 8, padding: '10px', cursor: 'pointer', fontSize: 13,
                    fontWeight: 600, fontFamily: 'var(--font-sans)', marginBottom: 8,
                  }}
                >
                  ⚡ View in Remediation Plan
                </button>
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    width: '100%', background: 'white', color: 'var(--mgray)',
                    border: '1px solid var(--lgray)',
                    borderRadius: 8, padding: '8px', cursor: 'pointer', fontSize: 12,
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: '24px 18px', textAlign: 'center', color: 'var(--mgray)' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>◎</div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', marginBottom: 6 }}>Click a debt bubble</p>
              <p style={{ fontSize: 12 }}>Select any item on the radar to see details, AI suggestions, and remediation options.</p>
              <div style={{ marginTop: 20, fontSize: 11, lineHeight: 1.8, textAlign: 'left', background: 'var(--offwht)', borderRadius: 8, padding: 12 }}>
                <strong style={{ color: 'var(--navy)' }}>Showing {filtered.length} items</strong><br />
                🔴 Critical: {filtered.filter(d=>d.severity==='critical').length}<br />
                🟡 High: {filtered.filter(d=>d.severity==='high').length}<br />
                🔵 Medium: {filtered.filter(d=>d.severity==='medium').length}<br />
                🟢 Low: {filtered.filter(d=>d.severity==='low').length}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
