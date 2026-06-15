import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Served from https://<user>.github.io/chess-the-move/ on GitHub Pages.
  base: '/chess-the-move/',
  plugins: [react()],
})
