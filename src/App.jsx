import { useState } from 'react'
import BottomNav from './components/BottomNav.jsx'
import ProfilePicker from './components/ProfilePicker.jsx'
import Trip from './tabs/Trip.jsx'
import Route from './tabs/Route.jsx'
import Packing from './tabs/Packing.jsx'
import Money from './tabs/Money.jsx'
import Info from './tabs/Info.jsx'
import { ProfileProvider, useProfile } from './lib/ProfileContext.jsx'

const SCREENS = { trip: Trip, route: Route, packing: Packing, money: Money, info: Info }

function Shell() {
  const { profile, setProfile } = useProfile()
  const [tab, setTab] = useState('trip')

  if (!profile) return <ProfilePicker />
  const Screen = SCREENS[tab]

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', paddingTop: 'calc(env(safe-area-inset-top) + 10px)',
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2, color: 'var(--accent)' }}>
          JEDDAH CHAPTER
        </span>
        <button onClick={() => setProfile('')} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 20, padding: '4px 12px', fontSize: 13, fontWeight: 600,
        }}>
          👤 {profile} <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>▾</span>
        </button>
      </header>

      {/* key={profile} remounts the tabs so all per-rider storage reloads on switch */}
      <main key={profile} style={{
        flex: 1,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}>
        <Screen />
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}

export default function App() {
  return (
    <ProfileProvider>
      <Shell />
    </ProfileProvider>
  )
}
