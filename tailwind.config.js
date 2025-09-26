/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#1f2937',
          subtle: '#111827',
          stronger: '#111b22'
        }
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
}
