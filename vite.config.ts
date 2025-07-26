import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Evitar caché en archivos JS/CSS
        entryFileNames: `assets/[name].[hash].js`,
        chunkFileNames: `assets/[name].[hash].js`,
        assetFileNames: `assets/[name].[hash].[ext]`
      }
    }
  },
  server: {
    host: true, // Permite conexiones externas
    port: 5173, // Puerto por defecto de Vite
    allowedHosts: [
      '.ngrok-free.app', // Permite todos los subdominios de ngrok
      '.ngrok.io',       // Permite subdominios de ngrok.io también
      '8c40e413a3cc.ngrok-free.app', // Tu URL específica de ngrok actualizada
      'localhost',
      '127.0.0.1'
    ],
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    hmr: false // Deshabilitar HMR para testing móvil con ngrok
  }
})
