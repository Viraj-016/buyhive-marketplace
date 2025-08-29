// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", 
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Luxe Botanical Theme
        primary: {
          50: '#F0F9F5',
          100: '#DBF0E7',
          200: '#B9E1D1',
          300: '#8FCCB5',
          400: '#65B297',
          500: '#52796F', // Main secondary
          600: '#40615A',
          700: '#2D4A3A',
          800: '#1B4332', // Main primary
          900: '#0F2922',
        },
        accent: {
          50: '#FDF5F3',
          100: '#FDE8E4',
          200: '#FBD5CE',
          300: '#F7B5A7',
          400: '#F29080',
          500: '#E76F51', // Main accent
          600: '#D85A3C',
          700: '#B94428',
          800: '#9A3621',
          900: '#7F2E1C',
        },
        cream: {
          50: '#FEFCFA',
          100: '#F8F5F0', // Main cream
          200: '#F2EDE6',
          300: '#E8E0D6',
          400: '#DDD2C4',
          500: '#D1C4B2',
          600: '#BBA996',
          700: '#9A8A79',
          800: '#7A6B5D',
          900: '#5C4F44',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Playfair Display', 'serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 30px -5px rgba(0, 0, 0, 0.05)',
        'large': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'elegant': '0 10px 15px -3px rgba(27, 67, 50, 0.1), 0 4px 6px -2px rgba(27, 67, 50, 0.05)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #1B4332 0%, #52796F 100%)',
        'gradient-warm': 'linear-gradient(135deg, #F8F5F0 0%, #E8E0D6 100%)',
      }
    },
  },
  plugins: [],
}
