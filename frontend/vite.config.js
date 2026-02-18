import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 600,
    // Enable minification with terser-like optimization
    minify: 'esbuild',
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Generate sourcemaps for production debugging (set to false for smallest bundles)
    sourcemap: false,
    // Target modern browsers for smaller bundles
    target: 'es2020',
    rollupOptions: {
      output: {
        // Manual chunks for better code splitting and caching
        manualChunks: {
          // React core - rarely changes, cache aggressively
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // SEO & helmet - used on every page
          'seo-vendor': ['react-helmet-async'],
          // HTTP client
          'http-vendor': ['axios'],
        },
        // Optimize chunk file naming for caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Enable CSS minification
    cssMinify: true,
    // Reduce bundle size by setting appropriate limits
    assetsInlineLimit: 4096, // Inline assets < 4KB as base64
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'react-helmet-async', 'axios'],
  },
  server: {
    // Expose server to network for access from other devices
    host: true,
    port: 5173,
    // Performance optimizations for dev server
    hmr: {
      overlay: true,
    },
    // Fast refresh for better DX
    watch: {
      usePolling: false,
    },
  },
})
