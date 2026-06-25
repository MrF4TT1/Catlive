import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite serve la SPA in sviluppo (porta 5173) e fa da proxy verso l'API Express (porta 4000).
// In produzione la build finisce in /dist e viene servita direttamente da Express.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
