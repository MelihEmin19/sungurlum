/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // --- SUNGURLU THEME (Midnight + Turquoise) ---
        primary: {
          DEFAULT: '#38C0BC', // Logo ile Birebir Uyumlu Turkuaz
          light: '#5CD6D3',
          dark: '#279995',
        },

        // Modül Renkleri
        food: {
          DEFAULT: '#FF8A3D', // Turuncu — Yemek modülü
          light: '#FFF0E6',
          dark: '#E67530',
        },
        market: {
          DEFAULT: '#35B978', // Yeşil — Market modülü
          light: '#E6F7EF',
          dark: '#2A9D68',
        },

        // Midnight tonu (koyu vurgular)
        midnight: '#151827',

        accent: '#151827',
        
        success: '#35B978',
        warning: '#F59E0B',
        danger: '#EF4444',
        background: '#F7F7FA',
        surface: '#FFFFFF',
        border: '#E5E7EB',
        divider: '#EDEDF0',
        textPrimary: '#171925',
        textSecondary: '#777A8A',
        textTertiary: '#A0A3B1',
        muted: '#A0A3B1',
      },
    },
  },
  plugins: [],
}
