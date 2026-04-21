import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      
      // --- TAMBAHKAN 3 BARIS INI UNTUK MEMAKSA PWA NYALA ---
      devOptions: {
        enabled: true
      },
      // ---------------------------------------------------

      includeAssets: [], 
      manifest: {
        name: 'Quotes Sentiment Dashboard',
        short_name: 'SentimentApp',
        description: 'Dashboard Analisis Sentimen Kutipan',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'https://dummyimage.com/192x192/2ecc71/ffffff.png&text=Q',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://dummyimage.com/512x512/2ecc71/ffffff.png&text=Q',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})