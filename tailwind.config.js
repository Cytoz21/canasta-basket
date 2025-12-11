/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Custom premium colors for CANASTA BASKET
                primary: {
                    DEFAULT: '#E63946', // Vibrant Red (Basketball vibe)
                    dark: '#D32F2F',
                    light: '#FF6B6B',
                },
                secondary: {
                    DEFAULT: '#1D3557', // Deep Navy Blue
                    light: '#457B9D',
                },
                accent: {
                    DEFAULT: '#F1FAEE', // Off-white/Ice
                    yellow: '#FFB703', // Pop color
                },
                surface: '#F8FAFC',
                darkSurface: '#0F172A'
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
