import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// When a new service worker takes control (after a deploy), reload once so the
// fresh app code runs immediately — no manual cache-clearing needed.
if ('serviceWorker' in navigator) {
  let reloading = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return
    reloading = true
    window.location.reload()
  })
  // Ask the SW to check for updates whenever the app regains focus.
  const checkForUpdate = () => navigator.serviceWorker.getRegistration().then(r => r && r.update()).catch(() => {})
  window.addEventListener('focus', checkForUpdate)
  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkForUpdate() })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
