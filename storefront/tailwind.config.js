/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: { 50:'#fdf9ec',100:'#faf0c8',200:'#f5dc8a',300:'#efc34e',400:'#e8ab2a',500:'#c9a84c',600:'#b8972e',700:'#8b6914',800:'#6b4f0f',900:'#4d360a' },
        ink:  { 50:'#fafaf8',100:'#f0ede8',200:'#e0dad2',300:'#c8bfb4',400:'#a09488',500:'#7d7068',600:'#5a4e46',700:'#3d332c',800:'#241e18',900:'#141008' },
      },
      fontFamily: {
        sans:  ['var(--font-inter)','system-ui','sans-serif'],
        serif: ['var(--font-playfair)','Georgia','serif'],
      },
    },
  },
  plugins: [],
};
