import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // TAMBAHKAN BARIS INI: Agar Vercel bisa membaca lokasi file dengan benar
  base: './', 
  
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      
      // Memastikan PWA aktif bahkan saat proses pengembangan
      devOptions: {
        enabled: true
      },

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