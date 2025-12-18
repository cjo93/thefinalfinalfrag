
/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./hooks/**/*.{js,ts,jsx,tsx}",
        "./services/**/*.{js,ts,jsx,tsx}",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            fontFamily: {
                serif: ['"Playfair Display"', 'serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
                sans: ['"Inter"', 'sans-serif'],
                blackletter: ['"UnifrakturMaguntia"', 'cursive'],
            },
            colors: {
                obsidian: '#050505',
                'void-light': '#0A0A0A',
                'signal-white': '#FFFFFF',
                'bone': '#F2F0E4',
                'tech-gold': '#E4E4E7', // Matching HTML config
                'friction-red': '#FF3333',
            },
            backgroundImage: {
                'black-continuum': 'radial-gradient(circle at 50% 0%, #1a1a1a 0%, #050505 80%)',
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'blink': 'blink 1s step-end infinite',
                'spin-slow': 'spin 12s linear infinite',
            },
            keyframes: {
                shimmer: {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' }
                },
                blink: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0' }
                }
            }
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
