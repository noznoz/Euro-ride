import { useState } from 'react'
import BottomNav from './components/BottomNav.jsx'
import Trip from './tabs/Trip.jsx'
import Route from './tabs/Route.jsx'
import Packing from './tabs/Packing.jsx'
import Money from './tabs/Money.jsx'
import Info from './tabs/Info.jsx'

const SCREENS = { trip: Trip, route: Route, packing: Packing, money: Money, info: Info }

export default function App() {
  const [tab, setTab] = useState('trip')
  const Screen = SCREENS[tab]

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <main style={{
        flex: 1,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        paddingTop: 'env(safe-area-inset-top)',
      }}>
        <Screen />
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}
