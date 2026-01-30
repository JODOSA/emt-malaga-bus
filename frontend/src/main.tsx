import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import 'leaflet/dist/leaflet.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register Service Worker
if('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
            console.log('✅ Service Worker registrado: ', registration.scope)
        })
        .catch((error) => {
            console.log('❌ Error al registrar Service Worker: ', error)
        })
    })
}
