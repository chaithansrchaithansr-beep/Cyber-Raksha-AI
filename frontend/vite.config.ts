import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES ? '/Cyber-Raksha-AI/' : '/',
  server: {
    port: 5173,
    host: '0.0.0.0'
  }
})
