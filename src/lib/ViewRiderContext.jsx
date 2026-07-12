import { createContext, useContext } from 'react'

// openRider(riderId) opens a full-screen profile view for any rider,
// from anywhere in the app (posts, photos, notifications, roster).
export const ViewRiderContext = createContext({ openRider: () => {} })
export const useViewRider = () => useContext(ViewRiderContext)
