/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        lavender: {
          50: '#FAF8FC',
          100: '#F3EAF8',
          200: '#EBE3F5',
          300: '#D8C7EC',
          400: '#B5A0D0',
          500: '#8E7AB5',
          600: '#7E60BF',
          700: '#6B538C',
          800: '#5A3E7E',
          900: '#3D255A',
        },
        charcoal: {
          DEFAULT: '#2B2622',
          soft: '#4A433C',
          muted: '#8A827A',
        },
        ivory: '#FAF8FC',
        beige: '#F4EFF7',
        line: '#E6DFED',
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'Fraunces', 'serif'],
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        custom: '6px',
      },
      maxWidth: {
        custom: '1320px',
      },
    },
  },
  plugins: [],
};
