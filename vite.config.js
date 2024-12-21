import react from '@vitejs/plugin-react';
// vite.config.js
export default {
  plugins: [react()],
  server: {
    port: 3000,
  },
  optimizeDeps: {
    exclude: [
      'three', // to prevent Vite's code chunking which causes an error
    ],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  build: {
    target: 'esnext',
  },
};
