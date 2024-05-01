// vite.config.js
export default {
  // vite.config.js
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
