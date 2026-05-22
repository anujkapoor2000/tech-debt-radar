import { useState } from 'react'
import Nav from './components/Nav'
import Dashboard from './components/Dashboard'
import RadarView from './components/RadarView'
import DebtRegister from './components/DebtRegister'
import RemediationPlan from './components/RemediationPlan'
import Analysis from './components/Analysis'

const TABS = [
  { id: 'dashboard',   label: '⬡ Dashboard',         component: Dashboard },
  { id: 'radar',       label: '◎ Radar View',         component: RadarView },
  { id: 'register',    label: '☰ Debt Register',      component: DebtRegister },
  { id: 'remediation', label: '⚡ Remediation Plan',  component: RemediationPlan },
  { id: 'analysis',    label: '◈ Analysis',           component: Analysis },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedItem, setSelectedItem] = useState(null)

  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--navy)' }}>
      <Nav
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={tab => { setActiveTab(tab); setSelectedItem(null) }}
      />
      <main style={{ flex: 1, overflow: 'hidden', background: 'var(--offwht)' }}>
        {ActiveComponent && (
          <ActiveComponent
            selectedItem={selectedItem}
            onSelectItem={setSelectedItem}
            onNavigate={setActiveTab}
          />
        )}
      </main>
    </div>
  )
}
