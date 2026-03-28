/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  safelist: [
  'bg-blue-500/20','text-blue-400',
  'bg-cyan-500/20','text-cyan-400',
  'bg-green-500/20','text-green-400',
  'bg-yellow-500/20','text-yellow-400',
  'bg-red-500/20','text-red-400',
],
  theme: {
    extend: {},
  },
  plugins: [],
}
