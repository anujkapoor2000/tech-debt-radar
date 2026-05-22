import { useState } from 'react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, PieChart, Pie, Legend } from 'recharts'
import { DEBT_ITEMS, CATEGORY_META, COMPONENT_COLORS, TREND_DATA } from '../data/debtData'

const COLORS = ['#DC2626','#D97706','#0072BC','#7C3AED','#00B753','#00BCCC']

export default function Analysis() {
  const [aiLoading, setAiLoading] = useState(false)
  const [aiReport, setAiReport] = useState(null)

  // Spider/radar chart data for component health
  const componentHealth = Object.keys(COMPONENT_COLORS).map(comp => {
    const items = DEBT_ITEMS.filter(d => d.component === comp)
    const critPct = items.filter(d=>d.severity==='critical').length / Math.max(items.length,1) * 100
    const avgEff  = items.reduce((a,i)=>a+i.effort,0) / Math.max(items.length,1)
    return {
      component: comp,
      'Issues': items.length,
      'Avg Effort': Math.round(avgEff * 10),
      'Critical %': Math.round(critPct),
      'Risk Score': Math.round((critPct * 0.6 + avgEff * 4)),
    }
  })

  // Pie: issues by category
  const catPie = Object.entries(CATEGORY_META).map(([key, meta]) => ({
    name: meta.label,
    value: DEBT_ITEMS.filter(d => d.category === key).length,
    color: meta.color,
  })).filter(x => x.value > 0)

  // Bar: effort by component
  const effortByComp = Object.entries(COMPONENT_COLORS).map(([comp, color]) => ({
    name: comp, color,
    totalSP: DEBT_ITEMS.filter(d=>d.component===comp).reduce((a,i)=>a+i.effort,0),
    issues:  DEBT_ITEMS.filter(d=>d.component===comp).length,
  }))

  // Radar chart for health dimensions
  const radarData = [
    { subject: 'Code Quality',  PC:72, CC:58, BC:65, Int:80 },
    { subject: 'Test Coverage', PC:35, CC:42, BC:30, Int:55 },
    { subject: 'OOTB Adherence',PC:60, CC:75, BC:50, Int:90 },
    { subject: 'API Modernity', PC:65, CC:70, BC:60, Int:55 },
    { subject: 'Config Health', PC:80, CC:68, BC:72, Int:85 },
    { subject: 'Complexity',    PC:45, CC:55, BC:50, Int:65 },
  ]

  const runAIAnalysis = () => {
    setAiLoading(true)
    setAiReport(null)
    setTimeout(() => {
      setAiLoading(false)
      setAiReport({
        headline: 'PolicyCenter custom Gosu code is your highest risk — 3 files account for 68% of your critical debt score.',
        findings: [
          { icon:'🔴', title:'Immediate Action Required', body:'ClaimDocumentEnhancement.gsx (847 lines) and CustomRatingPlugin.gsx should be Sprint 1 priorities. Both are cloud-incompatible as-is and block GW Upgrade path.' },
          { icon:'🟡', title:'Quick Win Available', body:'Deprecated PolicyPeriodAPI migration has an automated upgrade script. At 3 SP, this delivers measurable debt reduction with minimal risk — ideal for sprint padding.' },
          { icon:'🔵', title:'Architectural Pattern', body:'4 of 12 issues relate to bypassing GW framework APIs (direct SQL, custom SOAP, deprecated APIs). Establishing an API governance rule in your CI pipeline would prevent recurrence.' },
          { icon:'🟢', title:'Progress Noted', body:'8 issues resolved in last scan — your team is tracking well. Maintaining current velocity closes all S1 items within the sprint. Recommend adding automated debt gate to PR pipeline.' },
        ],
        savings: '£312k saved over 18 months if remediated per plan.',
        confidence: '94% AI detection confidence across all findings.',
      })
    }, 2200)
  }

  return (
    <div style={{ height:'calc(100vh - 54px)', overflow:'auto', padding:'20px 24px', background:'var(--offwht)' }}>
      {/* AI Analysis Panel */}
      <div style={{ background: aiReport ? 'linear-gradient(135deg,#0D1230,#111936)' : 'var(--navy)', borderRadius:'var(--radius-lg)', padding:'20px 24px', marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <h2 style={{ color:'white', fontSize:20, fontWeight:700, fontFamily:'var(--font-serif)', letterSpacing:'-0.3px', marginBottom:4 }}>
              AI Analysis Engine
            </h2>
            <p style={{ color:'rgba(255,255,255,0.5)', fontSize:12.5 }}>
              Claude analyses your full debt profile and generates actionable insights
            </p>
          </div>
          <button
            onClick={runAIAnalysis}
            disabled={aiLoading}
            style={{
              background: aiLoading ? 'rgba(255,255,255,0.1)' : 'var(--blue)',
              color:'white', border:'none', borderRadius:8, padding:'10px 22px',
              cursor: aiLoading ? 'default' : 'pointer', fontSize:13, fontWeight:600,
              fontFamily:'var(--font-sans)', display:'flex', alignItems:'center', gap:8,
              transition:'all 0.2s',
            }}>
            {aiLoading ? (
              <><span style={{ display:'inline-block', width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />Analysing…</>
            ) : (
              '✦ Run AI Analysis'
            )}
          </button>
        </div>

        {aiReport && (
          <div style={{ marginTop:18 }}>
            <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:10, padding:'14px 18px', marginBottom:14, fontSize:14, color:'rgba(255,255,255,0.9)', lineHeight:1.6, borderLeft:'3px solid var(--lblue)' }}>
              ✦ {aiReport.headline}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
              {aiReport.findings.map((f,i) => (
                <div key={i} style={{ background:'rgba(255,255,255,0.05)', borderRadius:10, padding:'14px 16px' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'white', marginBottom:6 }}>{f.icon} {f.title}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.65)', lineHeight:1.55 }}>{f.body}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:12, display:'flex', gap:14 }}>
              <span style={{ fontSize:11.5, color:'var(--amber)', fontWeight:600 }}>💰 {aiReport.savings}</span>
              <span style={{ fontSize:11.5, color:'var(--green)', fontWeight:600 }}>✓ {aiReport.confidence}</span>
            </div>
          </div>
        )}
      </div>

      {/* Charts grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1.2fr', gap:16, marginBottom:16 }}>
        {/* Pie: issues by category */}
        <div style={{ background:'white', borderRadius:'var(--radius-md)', boxShadow:'var(--shadow-sm)', overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--lgray)', fontSize:13, fontWeight:700, color:'var(--navy)' }}>Issues by Category</div>
          <div style={{ padding:'12px' }}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={catPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {catPie.map((e,i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background:'var(--navy)', border:'none', borderRadius:8, fontSize:12, color:'white' }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize:11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar: effort by component */}
        <div style={{ background:'white', borderRadius:'var(--radius-md)', boxShadow:'var(--shadow-sm)', overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--lgray)', fontSize:13, fontWeight:700, color:'var(--navy)' }}>Remediation Effort by Component</div>
          <div style={{ padding:'12px' }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={effortByComp} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--lgray)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize:10, fill:'var(--mgray)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:10, fill:'var(--mgray)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background:'var(--navy)', border:'none', borderRadius:8, fontSize:12, color:'white' }} formatter={(v) => [`${v} SP`]} />
                <Bar dataKey="totalSP" radius={[4,4,0,0]} name="Story Points">
                  {effortByComp.map((c,i) => <Cell key={i} fill={c.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spider: component health */}
        <div style={{ background:'white', borderRadius:'var(--radius-md)', boxShadow:'var(--shadow-sm)', overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--lgray)', fontSize:13, fontWeight:700, color:'var(--navy)' }}>Component Health Dimensions</div>
          <div style={{ padding:'12px' }}>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--lgray)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize:10, fill:'var(--mgray)' }} />
                <Radar name="PolicyCenter" dataKey="PC" stroke="#0072BC" fill="#0072BC" fillOpacity={0.15} strokeWidth={2} />
                <Radar name="ClaimCenter"  dataKey="CC" stroke="#00B753" fill="#00B753"  fillOpacity={0.12} strokeWidth={2} />
                <Legend iconSize={8} wrapperStyle={{ fontSize:10 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Key metrics table */}
      <div style={{ background:'white', borderRadius:'var(--radius-md)', boxShadow:'var(--shadow-sm)', overflow:'hidden' }}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--lgray)', fontSize:13, fontWeight:700, color:'var(--navy)', display:'flex', justifyContent:'space-between' }}>
          <span>Component Health Summary</span>
          <span style={{ fontSize:11, color:'var(--mgray)', fontWeight:400 }}>Lower score = better health</span>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid var(--lgray)' }}>
              {['Component','Issues','Critical','High','Total SP','Avg Effort','Risk Score'].map(h => (
                <th key={h} style={{ padding:'8px 18px', textAlign:'left', fontSize:11, fontWeight:700, color:'var(--mgray)', textTransform:'uppercase', letterSpacing:'0.4px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(COMPONENT_COLORS).map(([comp, color], i) => {
              const items = DEBT_ITEMS.filter(d => d.component === comp)
              const crit  = items.filter(d=>d.severity==='critical').length
              const high  = items.filter(d=>d.severity==='high').length
              const sp    = items.reduce((a,d)=>a+d.effort,0)
              const avg   = items.length ? (sp/items.length).toFixed(1) : 0
              const risk  = Math.round(crit*20 + high*10 + sp*0.5)
              return (
                <tr key={comp} style={{ background: i%2===0?'white':'var(--offwht)', borderBottom:'1px solid var(--lgray)' }}>
                  <td style={{ padding:'10px 18px' }}>
                    <span style={{ background:`${color}18`, color, border:`1px solid ${color}30`, borderRadius:8, padding:'3px 10px', fontSize:12, fontWeight:600 }}>{comp}</span>
                  </td>
                  <td style={{ padding:'10px 18px', fontFamily:'var(--font-mono)', fontSize:14, fontWeight:700, color:'var(--navy)' }}>{items.length}</td>
                  <td style={{ padding:'10px 18px', fontFamily:'var(--font-mono)', fontSize:13, fontWeight:700, color: crit>0?'var(--red)':'var(--mgray)' }}>{crit}</td>
                  <td style={{ padding:'10px 18px', fontFamily:'var(--font-mono)', fontSize:13, fontWeight:700, color: high>0?'#D97706':'var(--mgray)' }}>{high}</td>
                  <td style={{ padding:'10px 18px', fontFamily:'var(--font-mono)', fontSize:13, fontWeight:700, color:'var(--blue)' }}>{sp} SP</td>
                  <td style={{ padding:'10px 18px', fontFamily:'var(--font-mono)', fontSize:13, color:'var(--dgray)' }}>{avg} SP</td>
                  <td style={{ padding:'10px 18px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ flex:1, height:6, background:'var(--lgray)', borderRadius:3, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${Math.min(risk,100)}%`, background: risk>70?'var(--red)':risk>40?'#D97706':'var(--green)', borderRadius:3, transition:'width 0.8s' }} />
                      </div>
                      <span style={{ fontSize:12, fontWeight:700, fontFamily:'var(--font-mono)', color: risk>70?'var(--red)':risk>40?'#D97706':'var(--green)', minWidth:28 }}>{risk}</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
