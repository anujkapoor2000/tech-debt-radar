import { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { DEBT_ITEMS, TREND_DATA, CATEGORY_META, SEVERITY_META, COMPONENT_COLORS } from '../data/debtData'

const S = {
  page: { height: 'calc(100vh - 54px)', overflow: 'auto', padding: '20px 24px', background: 'var(--offwht)' },
  heroband: {
    background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy2) 60%, #0e1d4a 100%)',
    borderRadius: 'var(--radius-lg)', padding: '20px 28px', marginBottom: 20,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, marginBottom: 20 },
  kpiCard: (color, bg) => ({
    background: 'white', borderRadius: 'var(--radius-md)',
    padding: '16px 18px', boxShadow: 'var(--shadow-sm)',
    borderTop: `3px solid ${color}`, position: 'relative', overflow: 'hidden',
  }),
  grid3: { display: 'grid', gridTemplateColumns: '1fr 1.1fr 1.1fr', gap: 16 },
  card: {
    background: 'white', borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
  },
  cardHead: { padding: '14px 18px', borderBottom: '1px solid var(--lgray)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 13, fontWeight: 700, color: 'var(--navy)', letterSpacing: '-0.2px' },
}

function AnimatedNumber({ value, prefix = '', suffix = '', color }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0; const end = typeof value === 'number' ? value : 0
    const step = Math.ceil(end / 30)
    const t = setInterval(() => {
      start += step
      if (start >= end) { setDisplay(end); clearInterval(t) } else setDisplay(start)
    }, 30)
    return () => clearInterval(t)
  }, [value])
  const str = typeof value === 'string' ? value : display.toLocaleString()
  return <span style={{ color, fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 700 }}>{prefix}{str}{suffix}</span>
}

function SeverityBadge({ sev }) {
  const m = SEVERITY_META[sev]
  return (
    <span style={{
      background: m.bg, color: m.color, border: `1px solid ${m.border}`,
      borderRadius: 10, padding: '2px 8px', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px',
    }}>{m.label}</span>
  )
}

export default function Dashboard({ onNavigate, onSelectItem }) {
  const critical = DEBT_ITEMS.filter(d => d.severity === 'critical').length
  const high     = DEBT_ITEMS.filter(d => d.severity === 'high').length
  const totalEff = DEBT_ITEMS.reduce((a,i) => a+i.effort, 0)
  const debtScore= 68

  // Category breakdown
  const catBreakdown = Object.entries(CATEGORY_META).map(([key, meta]) => ({
    key, ...meta,
    count: DEBT_ITEMS.filter(d => d.category === key).length,
  })).sort((a,b) => b.count - a.count)

  // Component breakdown
  const compBreakdown = Object.entries(COMPONENT_COLORS).map(([name, color]) => ({
    name, color, count: DEBT_ITEMS.filter(d => d.component === name).length,
  }))

  const topIssues = DEBT_ITEMS.filter(d => ['critical','high'].includes(d.severity)).slice(0, 5)

  return (
    <div style={S.page}>
      {/* Hero */}
      <div style={S.heroband}>
        <div>
          <p style={{ color: 'var(--lblue)', fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 4 }}>
            LAST SCAN: TODAY 06:00 · 4m 32s · 1,847 files
          </p>
          <h1 style={{ color: 'white', fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-serif)', letterSpacing: '-0.5px' }}>
            Tech Debt Radar
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 2 }}>
            Continuous AI-powered code intelligence for Guidewire — identify, score and remediate weekly
          </p>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.8px' }}>New this week</div>
            <div style={{ color: '#FFC400', fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-serif)' }}>
              +4 <span style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.5)' }}>issues · 8 resolved</span>
            </div>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('radar')}
            style={{
              background: 'var(--blue)', border: 'none', color: 'white',
              padding: '10px 20px', borderRadius: 8, cursor: 'pointer',
              fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-sans)',
            }}
          >
            ◎ Open Radar
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={S.kpiRow}>
        {[
          { label: 'Debt Score',            value: debtScore,  color: '#DC2626', prefix:'', suffix:'/100' },
          { label: 'Total Issues',           value: DEBT_ITEMS.length, color:'var(--navy)', prefix:'', suffix:'' },
          { label: 'Critical / High',        value: `${critical} / ${high}`, color:'#DC2626', prefix:'', suffix:'' },
          { label: 'Est. Remediation (SP)',  value: totalEff,   color:'var(--blue)', prefix:'', suffix:' SP' },
          { label: 'OOTB Deviation',         value: 18,         color:'var(--purp)', prefix:'', suffix:'%' },
        ].map(k => (
          <div key={k.label} style={S.kpiCard(k.color, k.bg)}>
            <AnimatedNumber value={typeof k.value === 'number' ? k.value : k.value} color={k.color} prefix={k.prefix} suffix={k.suffix} />
            <div style={{ fontSize: 11, color: 'var(--mgray)', marginTop: 4, fontWeight: 500 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Main 3-col grid */}
      <div style={S.grid3}>
        {/* Col 1: Category + Component */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={S.card}>
            <div style={S.cardHead}>
              <span style={S.cardTitle}>Debt by Category</span>
              <span style={{ fontSize: 11, color: 'var(--mgray)' }}>{DEBT_ITEMS.length} total</span>
            </div>
            <div style={{ padding: '12px 18px' }}>
              {catBreakdown.map(cat => (
                <div key={cat.key} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: 'var(--dgray)', fontWeight: 500 }}>{cat.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: cat.color, fontFamily: 'var(--font-mono)' }}>{cat.count}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--lgray)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 3, background: cat.color,
                      width: `${(cat.count / catBreakdown[0].count) * 100}%`,
                      transition: 'width 0.8s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={S.card}>
            <div style={S.cardHead}>
              <span style={S.cardTitle}>By Component</span>
            </div>
            <div style={{ padding: '10px 18px' }}>
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={compBreakdown} barSize={28}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--mgray)' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ background: 'var(--navy)', border: 'none', borderRadius: 8, fontSize: 12, color: 'white' }}
                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                  />
                  <Bar dataKey="count" radius={[4,4,0,0]}>
                    {compBreakdown.map((c,i) => <Cell key={i} fill={c.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Col 2: Trend + Scan summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={S.card}>
            <div style={S.cardHead}>
              <span style={S.cardTitle}>Debt Score Trend — 12 Weeks</span>
            </div>
            <div style={{ padding: '12px 18px 6px' }}>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={TREND_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--lgray)" />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'var(--mgray)' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[60,80]} tick={{ fontSize: 10, fill: 'var(--mgray)' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--navy)', border: 'none', borderRadius: 8, fontSize: 12, color: 'white' }}
                  />
                  <Line
                    type="monotone" dataKey="score" stroke="var(--blue)" strokeWidth={2.5}
                    dot={{ fill: 'var(--blue)', r: 3 }} activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={S.card}>
            <div style={S.cardHead}>
              <span style={S.cardTitle}>Last Scan Summary</span>
              <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>✓ Completed</span>
            </div>
            <div style={{ padding: '12px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                ['New Issues',   '3',     'var(--red)'],
                ['Resolved',     '8',     'var(--green)'],
                ['Score Δ',      '−2pts', 'var(--green)'],
                ['Files Scanned','1,847', 'var(--blue)'],
                ['Gosu Classes', '312',   'var(--dgray)'],
                ['PCF Files',    '428',   'var(--dgray)'],
              ].map(([lbl,val,col]) => (
                <div key={lbl} style={{ background: 'var(--offwht)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, color: 'var(--mgray)', fontWeight: 500, marginBottom: 2 }}>{lbl}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: col, fontFamily: 'var(--font-mono)' }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Col 3: Top Issues */}
        <div style={S.card}>
          <div style={S.cardHead}>
            <span style={S.cardTitle}>Top Priority Issues</span>
            <button
              onClick={() => onNavigate && onNavigate('register')}
              style={{ fontSize: 11, color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              View all →
            </button>
          </div>
          <div style={{ padding: '8px 0' }}>
            {topIssues.map((item, i) => (
              <div
                key={item.id}
                onClick={() => { onSelectItem && onSelectItem(item); onNavigate && onNavigate('register') }}
                style={{
                  padding: '10px 18px', borderBottom: i < topIssues.length-1 ? '1px solid var(--lgray)' : 'none',
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--offwht)'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: 'var(--mgray)', marginBottom: 2, fontFamily: 'var(--font-mono)' }}>
                      {item.id} · {item.component}
                    </div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--navy)', lineHeight: 1.35 }}>
                      {item.title.length > 58 ? item.title.slice(0,55)+'…' : item.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--mgray)', marginTop: 4 }}>
                      → {item.aiSuggestion.slice(0,60)}…
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <SeverityBadge sev={item.severity} />
                    <span style={{ fontSize: 10.5, color: 'var(--mgray)', fontFamily: 'var(--font-mono)' }}>{item.effort} SP</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 18px', borderTop: '1px solid var(--lgray)', display: 'flex', gap: 10 }}>
            <button
              onClick={() => onNavigate && onNavigate('remediation')}
              style={{
                flex: 1, background: 'var(--navy)', color: 'white', border: 'none',
                borderRadius: 8, padding: '9px 0', cursor: 'pointer', fontSize: 12.5,
                fontWeight: 600, fontFamily: 'var(--font-sans)',
              }}
            >
              ⚡ View Remediation Plan
            </button>
            <button
              style={{
                background: 'white', color: 'var(--blue)', border: '1px solid var(--lgray)',
                borderRadius: 8, padding: '9px 14px', cursor: 'pointer', fontSize: 12.5,
                fontWeight: 600, fontFamily: 'var(--font-sans)',
              }}
            >
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
