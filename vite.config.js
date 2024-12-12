import react from '@vitejs/plugin-react';
// vite.config.js
export default {
  plugins: [react()],
  server: {
    port: 3000,
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
  build: {
    target: 'esnext',
  },
};
