/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class', // Enables dark mode via a 'dark' class
  theme: {
    extend: {
      colors: {
        primary: '#2080FF', // Example, replace with your colors
        secondary: '#FF4080',
        foreground: '#F0F0F0',
        background: '#242424',
        card: '#1A1A1A',
        muted: '#888888',
        accent: '#FFCC00',
        destructive: '#FF4444',
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.625rem',
        xl: '0.75rem',
      },
    },
  },
  plugins: [],
}
