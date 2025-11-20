import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'build',
    assetsDir: 'static',
    // Generate manifest for asset tracking
    manifest: false,
    // Ensure compatibility with Forge
    rollupOptions: {
      output: {
        // Use consistent naming for better caching
        entryFileNames: 'static/js/[name].[hash].js',
        chunkFileNames: 'static/js/[name].[hash].js',
        assetFileNames: 'static/[ext]/[name].[hash].[ext]'
      }
    }
  },
  server: {
    port: 3001,
    open: false
  }
});
