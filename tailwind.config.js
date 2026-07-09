/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './client/src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 950: '#070310', 900: '#0c0618', 850: '#130a24', 800: '#1a0f2e', 700: '#241640' },
        // "brand" resta usato in tutto il codice: ora è viola neon
        brand: { 100: '#f3e9ff', 200: '#e2d1fb', 300: '#d8b4fe', 400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce' },
        neon: { purple: '#a855f7', pink: '#ec4899', fuchsia: '#d946ef', violet: '#7c3aed', cyan: '#22d3ee' },
        // Palette premium della landing (rispetta il brief esatto)
        void: '#050505',
        surface: '#101010',
        royal: '#7B2CFF',   // primary
        glow: '#C084FC',    // glow
        lilac: '#E9D5FF',   // highlight
        mute: '#B9B9B9',    // testo secondario
      },
      fontFamily: {
        display: ['Orbitron', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        hero: ['Space Grotesk', 'Rajdhani', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Rajdhani', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 18px rgba(168,85,247,0.55), 0 0 38px rgba(236,72,153,0.28)',
        'neon-sm': '0 0 10px rgba(168,85,247,0.5)',
        'neon-pink': '0 0 18px rgba(236,72,153,0.6)',
        'inset-neon': 'inset 0 0 22px rgba(168,85,247,0.25)',
        // glow morbidi e diffusi per l'estetica premium
        'glow-soft': '0 20px 60px -20px rgba(123,44,255,0.55), 0 0 30px rgba(168,85,247,0.28)',
        'glow-card': '0 24px 60px -24px rgba(0,0,0,0.85), 0 0 26px rgba(168,85,247,0.35)',
        'glow-strong': '0 0 30px rgba(192,132,252,0.65), 0 0 70px rgba(123,44,255,0.4)',
      },
      backgroundImage: {
        'radial-violet': 'radial-gradient(circle at center, rgba(123,44,255,0.35), transparent 70%)',
      },
      keyframes: {
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        glow: { '0%,100%': { opacity: '0.55' }, '50%': { opacity: '1' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        gradient: { '0%,100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
        fadeup: { '0%': { opacity: '0', transform: 'translateY(14px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        popin: { '0%': { opacity: '0', transform: 'scale(0.92)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        scan: { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(400%)' } },
        spinslow: { to: { transform: 'rotate(360deg)' } },
        pulseglow: { '0%,100%': { opacity: '0.4', transform: 'scale(1)' }, '50%': { opacity: '0.85', transform: 'scale(1.06)' } },
        driftx: { '0%,100%': { transform: 'translateX(0)' }, '50%': { transform: 'translateX(24px)' } },
      },
      animation: {
        floaty: 'floaty 4s ease-in-out infinite',
        glow: 'glow 2.6s ease-in-out infinite',
        shimmer: 'shimmer 2.4s linear infinite',
        gradient: 'gradient 9s ease infinite',
        fadeup: 'fadeup 0.5s ease both',
        popin: 'popin 0.35s ease both',
        scan: 'scan 3.5s linear infinite',
        spinslow: 'spinslow 1.1s linear infinite',
        pulseglow: 'pulseglow 6s ease-in-out infinite',
        driftx: 'driftx 12s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
