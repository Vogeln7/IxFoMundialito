import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      // En desarrollo, redirige /api/* al servidor Express
      '/api': 'http://localhost:3001',
    }
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 100000000,
  }
})
