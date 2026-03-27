import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),

    // PWA Configuration
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo192.png'],
      manifest: {
        name: 'Jastip App',
        short_name: 'Jastip',
        description: 'Aplikasi Manajemen Jastip',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'logo192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'logo192.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})