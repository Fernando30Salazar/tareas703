/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif']
      },
      colors: {
        ink: '#1B1F27',
        canvas: '#F5F6F8',
        surface: '#FFFFFF',
        line: '#E4E6EA',
        muted: '#6B7280',
        accent: {
          DEFAULT: '#0E7C66',
          soft: '#E4F3EF',
          dark: '#0A5F4E'
        },
        priority: {
          alta: '#C4482E',
          altaSoft: '#F7E7E3',
          media: '#B9821B',
          mediaSoft: '#F6ECD9',
          baja: '#4C6FA5',
          bajaSoft: '#E7EDF6'
        }
      },
      borderRadius: {
        card: '10px'
      }
    }
  },
  plugins: []
}
