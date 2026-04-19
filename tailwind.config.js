/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        shell: '#070B16',
        panel: '#0E1424',
        panelSoft: '#131C32',
        line: '#253450'
      },
      boxShadow: {
        glow: '0 20px 60px rgba(4, 215, 255, 0.12)',
        card: '0 12px 30px rgba(0, 0, 0, 0.35)'
      },
      backgroundImage: {
        hero: 'radial-gradient(circle at 10% 10%, rgba(59,130,246,0.18), transparent 42%), radial-gradient(circle at 85% 15%, rgba(16,185,129,0.16), transparent 38%), radial-gradient(circle at 50% 95%, rgba(139,92,246,0.18), transparent 35%)'
      }
    }
  },
  plugins: []
};
