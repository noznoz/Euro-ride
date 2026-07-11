import { useCallback, useRef, useState } from 'react'
import { usePullToRefresh, PULL_THRESHOLD } from './lib/usePullToRefresh.js'
import BottomNav from './components/BottomNav.jsx'
import ProfilePicker from './components/ProfilePicker.jsx'
import AuthScreen from './auth/AuthScreen.jsx'
import PendingScreen from './auth/PendingScreen.jsx'
import Trip from './tabs/Trip.jsx'
import Route from './tabs/Route.jsx'
import Profile from './tabs/Profile.jsx'
import News from './tabs/News.jsx'
import Packing from './tabs/Packing.jsx'
import Money from './tabs/Money.jsx'
import Info from './tabs/Info.jsx'
import { AuthProvider, useAuth } from './lib/AuthContext.jsx'
import { ProfileProvider, useProfile } from './lib/ProfileContext.jsx'
import { RiderContext } from './lib/RiderContext.jsx'

const SCREENS = { trip: Trip, route: Route, profile: Profile, news: News, packing: Packing, money: Money, info: Info }

function Tabs({ rider, chipLabel, onChipTap }) {
  const [tab, setTab] = useState('trip')
  const Screen = SCREENS[tab]
  const mainRef = useRef(null)

  // Pull down from the top to reload the app (fresh data + latest version).
  const onRefresh = useCallback(async () => {
    await new Promise(r => setTimeout(r, 300))
    window.location.reload()
    await new Promise(() => {}) // keep the spinner up until the reload happens
  }, [])
  const { pullDistance, refreshing } = usePullToRefresh(mainRef, onRefresh)
  const active = refreshing || pullDistance > 0
  const spin = refreshing || pullDistance >= PULL_THRESHOLD

  return (
    <RiderContext.Provider value={rider}>
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
          <button onClick={onChipTap} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 20, padding: '4px 12px', fontSize: 13, fontWeight: 600,
          }}>
            👤 {chipLabel} <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>▾</span>
          </button>
        </header>

        <main ref={mainRef} style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          position: 'relative',
        }}>
          {/* Pull-to-refresh spinner */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: refreshing ? 44 : Math.max(0, pullDistance),
            opacity: active ? 1 : 0,
            pointerEvents: 'none', overflow: 'hidden', zIndex: 5,
          }}>
            <span style={{
              width: 22, height: 22, borderRadius: '50%',
              border: '2px solid var(--border)', borderTopColor: 'var(--accent)',
              display: 'block',
              animation: spin ? 'ptr-spin 0.7s linear infinite' : 'none',
              transform: spin ? 'none' : `rotate(${pullDistance * 3}deg)`,
            }} />
          </div>

          {/* key remounts the tabs so per-rider storage reloads on switch */}
          <div key={rider.uid} style={{
            transform: active && !refreshing ? `translateY(${pullDistance}px)` : 'none',
          }}>
            <Screen />
          </div>
        </main>
        <BottomNav active={tab} onChange={setTab} />
      </div>
    </RiderContext.Provider>
  )
}

function Splash() {
  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40 }}>🏍️</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>Warming up the engine…</div>
      </div>
    </div>
  )
}

// Local mode — no Supabase configured. Same app, data stays on this device.
function LocalShell() {
  const { profile, setProfile } = useProfile()
  if (!profile) return <ProfilePicker />
  return (
    <Tabs
      rider={{ name: profile, uid: `local:${profile}`, remote: false }}
      chipLabel={profile}
      onChipTap={() => setProfile('')}
    />
  )
}

// Shared mode — signed in to the chapter's Supabase backend.
function RemoteShell() {
  const { profile, user, signOut } = useAuth()
  const name = profile?.name || 'Rider'
  return (
    <Tabs
      rider={{ name, uid: user.id, remote: true }}
      chipLabel={name}
      onChipTap={() => { if (confirm('Sign out?')) signOut() }}
    />
  )
}

function Root() {
  const { isConfigured, loading, user, isApproved } = useAuth()

  if (!isConfigured) {
    return <ProfileProvider><LocalShell /></ProfileProvider>
  }
  if (loading) return <Splash />
  if (!user) return <AuthScreen />
  if (!isApproved) return <PendingScreen />
  return <RemoteShell />
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  )
}
