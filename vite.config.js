import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // '/' for root-domain hosts; '/euro-ride/' for GitHub Pages
  base: process.env.VITE_BASE || '/',
  server: { port: process.env.PORT ? Number(process.env.PORT) : 5173 },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
      },
      manifest: {
        name: 'Jeddah Chapter Euro Ride',
        short_name: 'Jeddah Chapter Euro Ride',
        description: 'Jeddah Chapter Europe Ride 2026 — itinerary, checklists, expenses and riding info',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        icons: [
          // Relative so they resolve correctly under any base path
          { src: 'tour-icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'tour-icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
})
