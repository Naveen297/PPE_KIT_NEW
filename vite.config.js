
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/styles': path.resolve(__dirname, './src/styles'),
      '@/assets': path.resolve(__dirname, './src/assets'),
      '@/data': path.resolve(__dirname, './src/data'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/contexts': path.resolve(__dirname, './src/contexts'),
      '@/test': path.resolve(__dirname, './src/test'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.jsx'], 
    css: true,
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion', 'lucide-react'],
        },
      },
    },
  },
})