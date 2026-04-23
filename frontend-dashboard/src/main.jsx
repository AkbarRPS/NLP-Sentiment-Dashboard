import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Pendaftaran Service Worker untuk PWA
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    // Logika jika ada update aplikasi baru (bisa dikosongkan sementara)
  },
  onOfflineReady() {
    console.log('Aplikasi siap digunakan!')
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)