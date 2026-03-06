import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    svgr(),
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true,
    allowedHosts: ['soloist-ui.ru.tuna.am', 'soloist-ai.com'],
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: ['soloist-ui.ru.tuna.am', 'soloist-ai.com'],
  },
  build: {
    outDir: 'build',
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return;
          // All react internals in one chunk to prevent circular deps with catch-all
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/') ||
            id.includes('node_modules/use-sync-external-store/')
          ) return 'vendor-react';
          if (id.includes('node_modules/react-router')) return 'vendor-router';
          if (id.includes('node_modules/gsap/') || id.includes('node_modules/motion/')) return 'vendor-animation';
          if (id.includes('node_modules/graphql')) return 'vendor-graphql';
          if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next')) return 'vendor-i18n';
          if (id.includes('node_modules/@lottiefiles/') || id.includes('node_modules/@dotlottie/')) return 'vendor-lottie';
          if (id.includes('node_modules/@radix-ui/') || id.includes('node_modules/@headlessui/')) return 'vendor-ui';
          if (id.includes('node_modules/@stomp/')) return 'vendor-stomp';
          // Everything else: one stable vendor chunk (one-way dep → vendor-react, no circular)
          return 'vendor';
        },
      },
    },
  },
});
