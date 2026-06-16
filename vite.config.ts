import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // Served from https://<user>.github.io/chess-the-move/ on GitHub Pages.
  base: '/chess-the-move/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Exclude the large Stockfish engine from the SW precache manifest.
        globIgnores: ['**/engine/**'],
      },
      manifest: {
        name: 'Chess — Next the Move',
        short_name: 'Chess Move',
        description: 'Guess the next move in famous chess games and score points.',
        theme_color: '#2d1a0e',
        background_color: '#1a0e07',
        display: 'standalone',
        scope: '/chess-the-move/',
        start_url: '/chess-the-move/',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})
