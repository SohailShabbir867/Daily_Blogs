import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Increase chunk size warning limit to 600KB (current bundle is ~524KB)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Manual chunks for better code splitting and caching
        manualChunks: {
          // Vendor libraries - these rarely change so can be cached separately
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Admin pages - lazy loaded for non-admin users
          'admin-pages': [
            './src/pages/admin/AdminDashboard.jsx',
            './src/pages/admin/CreateBlog.jsx',
            './src/pages/admin/EditBlog.jsx',
            './src/pages/admin/ManageBlogs.jsx',
            './src/pages/admin/UserManagement.jsx',
            './src/pages/admin/ContactsManagement.jsx',
            './src/pages/admin/SendNotifications.jsx',
          ],
        },
      },
    },
  },
  server: {
    // Expose server to network for access from other devices
    host: true, // or use '0.0.0.0'
    port: 5173, // default Vite port
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
