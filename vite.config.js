// Di dalam defineProject atau defineConfig -> plugins -> VitePWA
manifest: {
  name: 'Jastip App',
  short_name: 'Jastip',
  description: 'Aplikasi Manajemen Jastip',
  theme_color: '#ffffff',
  icons: [
    {
      src: 'logo192.png', // Sesuaikan nama file di sini
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any maskable'
    },
    {
      src: 'logo192.png', // Kamu bisa pakai file yang sama untuk 512
      sizes: '512x512',
      type: 'image/png'
    }
  ]
}