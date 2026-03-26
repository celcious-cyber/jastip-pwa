/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warna utama sesuai desain Jastip
        'jastip-pink': '#FA4F82', 
        'jastip-dark': '#942E4D',
      },
      fontFamily: {
        // Mendaftarkan font agar bisa dipanggil lewat class 'font-poppins'
        poppins: ['Poppins', 'sans-serif'],
        poetsen: ['Poetsen One', 'sans-serif'],
      },
      borderRadius: {
        // Lengkungan kartu putih yang lebar (custom)
        'jastip': '2.5rem',
      },
      backgroundImage: {
        // Gradien pink untuk halaman login
        'pink-gradient': "linear-gradient(to bottom, #FA4F82, #942E4D)",
      }
    },
  },
  plugins: [],
}