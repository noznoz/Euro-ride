import { createContext, useContext, useState } from 'react'

// Which rider is using this device. All personal data (expenses,
// reservations, packing ticks, ride progress) is stored under this name,
// so each friend gets their own data on their own phone.
const Ctx = createContext(null)

export function ProfileProvider({ children }) {
  const [profile, setProfileState] = useState(() => localStorage.getItem('euroride.profile') || '')
  const setProfile = (name) => {
    localStorage.setItem('euroride.profile', name)
    setProfileState(name)
  }
  return <Ctx.Provider value={{ profile, setProfile }}>{children}</Ctx.Provider>
}

export const useProfile = () => useContext(Ctx)
