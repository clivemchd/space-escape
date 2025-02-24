import { defineConfig } from 'vite';

export default defineConfig({
  base: '/space-escape/',
  server: {
    port: 5173,
    open: true
  },
  build: {
    target: 'esnext',
    outDir: 'dist'
  },
  optimizeDeps: {
    include: ['three']
  }
}); 