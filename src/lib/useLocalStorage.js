import { useState } from 'react'

// Persisted React state — survives app restarts, lives only on this device.
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  const set = (next) => {
    setValue((prev) => {
      const resolved = typeof next === 'function' ? next(prev) : next
      try {
        localStorage.setItem(key, JSON.stringify(resolved))
      } catch {
        // storage full/blocked — state still updates for this session
      }
      return resolved
    })
  }

  return [value, set]
}
