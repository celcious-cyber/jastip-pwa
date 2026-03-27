import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      manifest: {
        name: 'Jastip App',
        short_name: 'Jastip',
        description: 'Aplikasi Manajemen Jastip',
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