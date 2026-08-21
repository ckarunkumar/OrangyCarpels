/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: '#FCFCFC',
          sidebar: '#F7F7F7',
          border: '#E8E8E8',
          text: '#1C1C1C',
          muted: '#666666',
          hover: '#F0F0F0',
        },
        brand: {
          orange: '#FF5C00', // Sleek orange accent for "Orangy Carpels"
          blue: '#18A0FB',   // Figma blue accent for selected/interactive states
          green: '#10B981',  // Success states
          red: '#EF4444',    // Error/alert states
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif'
        ],
      },
    },
  },
  plugins: [],
}
