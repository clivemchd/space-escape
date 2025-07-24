import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    port: 5173,
    open: true
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  optimizeDeps: {
    include: ['three']
  },
  publicDir: 'public',
  assetsInclude: ['**/*.gltf', '**/*.bin', '**/*.jpg', '**/*.png']
}); 