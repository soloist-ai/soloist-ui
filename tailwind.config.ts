import type { Config } from 'tailwindcss';

const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        tech: ['JetBrains Mono', 'Courier New', 'monospace'],
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      colors: {
        solo: {
          dark: '#0a0e27',
          darker: '#050812',
          navy: '#1a1f3a',
          blue: '#1e3a5f',
          neon: {
            blue: '#00d4ff',
            cyan: '#00ffff',
            light: '#4dd0e1',
            dark: '#0097a7',
          },
          glow: {
            blue: '#00d4ff',
            cyan: '#00ffff',
            purple: '#7c3aed',
          },
        },
      },
      boxShadow: {
        'neon-blue': '0 0 20px rgba(0, 212, 255, 0.5), 0 0 40px rgba(0, 212, 255, 0.3), 0 0 60px rgba(0, 212, 255, 0.2)',
        'neon-cyan': '0 0 20px rgba(0, 255, 255, 0.6), 0 0 40px rgba(0, 255, 255, 0.4), 0 0 60px rgba(0, 255, 255, 0.3)',
        'neon-strong': '0 0 30px rgba(0, 212, 255, 0.8), 0 0 60px rgba(0, 212, 255, 0.5), 0 0 90px rgba(0, 212, 255, 0.3), inset 0 0 30px rgba(0, 212, 255, 0.1)',
      },
      backgroundImage: {
        'solo-gradient': 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)',
        'neon-gradient': 'linear-gradient(135deg, #00d4ff 0%, #00ffff 50%, #7c3aed 100%)',
        holographic: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 255, 255, 0.15) 25%, rgba(124, 58, 237, 0.1) 50%, rgba(0, 255, 255, 0.15) 75%, rgba(0, 212, 255, 0.1) 100%)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'glow-strong': 'glow-strong 3s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
        holographic: 'holographic 4s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.5), 0 0 40px rgba(0, 212, 255, 0.3)',
            opacity: '1',
          },
          '50%': {
            boxShadow: '0 0 30px rgba(0, 212, 255, 0.8), 0 0 60px rgba(0, 212, 255, 0.5)',
            opacity: '0.9',
          },
        },
        'glow-strong': {
          '0%, 100%': {
            boxShadow: '0 0 30px rgba(0, 212, 255, 0.8), 0 0 60px rgba(0, 212, 255, 0.5), 0 0 90px rgba(0, 212, 255, 0.3)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(0, 255, 255, 1), 0 0 80px rgba(0, 255, 255, 0.7), 0 0 120px rgba(0, 255, 255, 0.5)',
          },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        holographic: {
          '0%, 100%': {
            backgroundPosition: '0% 50%',
            filter: 'hue-rotate(0deg)',
          },
          '50%': {
            backgroundPosition: '100% 50%',
            filter: 'hue-rotate(90deg)',
          },
        },
      },
    },
  },
};

export default config;
