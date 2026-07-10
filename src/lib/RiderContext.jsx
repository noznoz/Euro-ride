import { createContext, useContext } from 'react'

// Who is using the app right now, in either mode:
//  - remote: true  → Supabase account (uid = auth user id, shared data)
//  - remote: false → local profile picked on this device only
export const RiderContext = createContext({ name: '', uid: '', remote: false })
export const useRider = () => useContext(RiderContext)
