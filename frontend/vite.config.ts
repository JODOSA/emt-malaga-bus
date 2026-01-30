import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({registerType: 'autoUpdate', 
        includeAssets: ['icon-192.png', 'icon-512.png'],
        manifest: {
            name: 'EMT Málaga Bus',
            short_name: 'EMT Málaga',
            description: 'Encuentra paradas de bus cercanas y consulta horarios en tiempo real',
            theme_color: '#0066cc',
            background_color: '#ffffff',
            display: 'standalone',
            icons: [
                {
                    src: 'icon-192.png',
                    sizes: '192x192',
                    type: 'image/png'
                },
                {
                    src: 'icon-512.png',
                    sizes: '512x512',
                    type: 'image/png'
                }
            ]
        },
        workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg}']
            }
        })
    ],
})
