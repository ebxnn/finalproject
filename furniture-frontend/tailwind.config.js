/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // Scan these directories for Tailwind classes
    './public/index.html', 
    // './src/components/AdminDashboard.js'     // If using in an HTML file too
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f5ff',
          100: '#e1ebff',
          200: '#c4d7ff',
          300: '#a0bdff',
          400: '#6797ff',
          500: '#3b70ff', // Primary color (used in buttons, links, etc.)
          600: '#2b5ae0',
          700: '#2448b0',
          800: '#1d3780',
          900: '#172a60',
        },
        secondary: '#FF765E', // You can define secondary or custom brand colors here
      },
      spacing: {
        '128': '32rem',
      },
      boxShadow: {
        'soft-glow': '0 4px 6px rgba(0, 0, 0, 0.1)', // Soft shadow for hover effects
      },
    },
  },
  plugins: [],
}
