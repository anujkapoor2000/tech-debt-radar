import { useState } from 'react'
import { DEBT_ITEMS, SEVERITY_META, CATEGORY_META, COMPONENT_COLORS } from '../data/debtData'

const STATUS_META = {
  'in-progress': { label: 'In Progress', color: '#0072BC', bg: '#EFF6FF' },
  'todo':        { label: 'To Do',        color: '#D97706', bg: '#FFFBEB' },
  'planned':     { label: 'Planned',      color: '#00BCCC', bg: '#F0FEFF' },
  'backlog':     { label: 'Backlog',      color: '#8C9BAB', bg: '#F3F6FA' },
  'done':        { label: 'Done',         color: '#00B753', bg: '#F0FDF4' },
}

export default function DebtRegister({ selectedItem, onSelectItem }) {
  const [search, setSearch] = useState('')
  const [sevF, setSevF] = useState('all')
  const [compF, setCompF] = useState('all')
  const [catF, setCatF] = useState('all')
  const [sortBy, setSortBy] = useState('severity')
  const [expandedId, setExpandedId] = useState(selectedItem?.id || null)

  const sevOrder = { critical:0, high:1, medium:2, low:3 }

  const filtered = DEBT_ITEMS
    .filter(d =>
      (sevF === 'all' || d.severity === sevF) &&
      (compF === 'all' || d.component === compF) &&
      (catF === 'all' || d.category === catF) &&
      (search === '' || d.title.toLowerCase().includes(search.toLowerCase()) ||
       d.file.toLowerCase().includes(search.toLowerCase()) || d.id.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a,b) => {
      if (sortBy === 'severity') return sevOrder[a.severity] - sevOrder[b.severity]
      if (sortBy === 'effort')   return b.effort - a.effort
      if (sortBy === 'component') return a.component.localeCompare(b.component)
      return 0
    })

  const SevBadge = ({ sev }) => {
    const m = SEVERITY_META[sev]
    return <span style={{ background:m.bg, color:m.color, border:`1px solid ${m.border}`, borderRadius:10, padding:'2px 8px', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.4px' }}>{m.label}</span>
  }

  const StatusBadge = ({ s }) => {
    const m = STATUS_META[s] || STATUS_META['backlog']
    return <span style={{ background:m.bg, color:m.color, borderRadius:10, padding:'2px 8px', fontSize:10.5, fontWeight:600 }}>{m.label}</span>
  }

  return (
    <div style={{ height: 'calc(100vh - 54px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--lgray)', padding: '12px 24px', display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search issues, files, IDs…"
          style={{ flex: 1, maxWidth: 320, padding: '8px 12px', border: '1px solid var(--lgray)', borderRadius: 8, fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none', color: 'var(--dgray)' }}
        />

        {[
          { label: 'Severity', val: sevF, set: setSevF, opts: [['all','All Severity'],['critical','Critical'],['high','High'],['medium','Medium'],['low','Low']] },
          { label: 'Component', val: compF, set: setCompF, opts: [['all','All Components'],['PolicyCenter','PolicyCenter'],['ClaimCenter','ClaimCenter'],['BillingCenter','BillingCenter'],['Integration','Integration']] },
          { label: 'Category', val: catF, set: setCatF, opts: [['all','All Categories'], ...Object.entries(CATEGORY_META).map(([k,v]) => [k, v.label])] },
        ].map(f => (
          <select key={f.label} value={f.val} onChange={e => f.set(e.target.value)}
            style={{ padding:'7px 10px', border:'1px solid var(--lgray)', borderRadius:8, fontSize:12.5, fontFamily:'var(--font-sans)', color:'var(--dgray)', background:'white', cursor:'pointer' }}>
            {f.opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}

        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ padding:'7px 10px', border:'1px solid var(--lgray)', borderRadius:8, fontSize:12.5, fontFamily:'var(--font-sans)', color:'var(--dgray)', background:'white', cursor:'pointer' }}>
          <option value="severity">Sort: Severity</option>
          <option value="effort">Sort: Effort</option>
          <option value="component">Sort: Component</option>
        </select>

        <span style={{ fontSize: 12, color: 'var(--mgray)', marginLeft: 'auto' }}>
          {filtered.length} of {DEBT_ITEMS.length} items
        </span>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--lgray)' }}>
              {['#','Component','Issue','Severity','Effort','Sprint','Status',''].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--mgray)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, i) => {
              const isExpanded = expandedId === item.id
              const cc = COMPONENT_COLORS[item.component] || 'var(--mgray)'
              return (
                <>
                  <tr
                    key={item.id}
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    style={{
                      background: isExpanded ? 'var(--offwht)' : (i % 2 === 0 ? 'white' : 'white'),
                      borderBottom: '1px solid var(--lgray)',
                      cursor: 'pointer',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = 'var(--offwht)' }}
                    onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = 'white' }}
                  >
                    <td style={{ padding: '10px 12px', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--mgray)', whiteSpace: 'nowrap' }}>
                      {isExpanded ? '▼' : '▶'} {item.id}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ background: `${cc}18`, color: cc, border: `1px solid ${cc}30`, borderRadius: 10, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
                        {item.component}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', maxWidth: 380 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', lineHeight: 1.3 }}>{item.title}</div>
                      {item.file && item.file !== 'Multiple' && (
                        <div style={{ fontSize: 11, color: 'var(--mgray)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                          {item.file}{item.lines > 0 ? ` · ${item.lines} lines` : ''}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}><SevBadge sev={item.severity} /></td>
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: item.effort >= 8 ? 'var(--red)' : item.effort >= 5 ? '#D97706' : 'var(--green)' }}>
                      {item.effort} SP
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 12.5, fontWeight: 700, color: 'var(--blue)' }}>{item.sprint}</td>
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}><StatusBadge s={item.status} /></td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {item.tags?.slice(0,2).map(t => (
                          <span key={t} style={{ background: 'var(--offwht)', border: '1px solid var(--lgray)', color: 'var(--mgray)', borderRadius: 8, padding: '1px 6px', fontSize: 10 }}>{t}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${item.id}-exp`} style={{ background: 'var(--offwht)', borderBottom: '2px solid var(--lgray)' }}>
                      <td colSpan={8} style={{ padding: '0 24px 16px 48px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, paddingTop: 14 }}>
                          <div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--mgray)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>AI Suggestion</p>
                            <div style={{ background: 'rgba(0,114,188,0.06)', border: '1px solid rgba(0,114,188,0.18)', borderRadius: 8, padding: '10px 12px', fontSize: 12.5, lineHeight: 1.5, color: 'var(--dgray)' }}>
                              ✦ {item.aiSuggestion}
                            </div>
                          </div>
                          {item.breakdown && (
                            <div>
                              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--mgray)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Issue Breakdown</p>
                              {item.breakdown.map(b => (
                                <div key={b.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--lgray)', fontSize: 12 }}>
                                  <span style={{ color: 'var(--dgray)' }}>{b.name}</span>
                                  <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: SEVERITY_META[item.severity]?.color }}>{b.count}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--mgray)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>All Tags</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {item.tags?.map(t => (
                                <span key={t} style={{ background: 'white', border: '1px solid var(--lgray)', color: 'var(--dgray)', borderRadius: 8, padding: '3px 8px', fontSize: 11.5, fontWeight: 500 }}>{t}</span>
                              ))}
                            </div>
                            {item.newThisWeek && (
                              <div style={{ marginTop: 10, background: '#FFF7ED', border: '1px solid #FDE68A', borderRadius: 8, padding: '6px 10px', fontSize: 11.5, color: '#D97706', fontWeight: 600 }}>
                                ⚡ New this week
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
