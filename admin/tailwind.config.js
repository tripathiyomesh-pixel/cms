/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FBF7EE', 100: '#F5ECDA', 200: '#E8D89A',
          300: '#D4BF6E', 400: '#C9A84C', 500: '#B8973E',
          600: '#9A7B30', 700: '#7C6226', 800: '#5E4A1C', 900: '#3F3112',
        },
        ink: {
          50: '#F7F5F0', 100: '#E8E4DC', 200: '#D8D3C8',
          300: '#B0ABA0', 400: '#7A7A7A', 500: '#5A5A5A',
          600: '#3D3D3D', 700: '#2A2520', 800: '#1A1612', 900: '#0F0F0F',
        },
      },
      fontFamily: {
        display: ['Cormorant', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
