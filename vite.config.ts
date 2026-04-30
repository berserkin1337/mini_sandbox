import { defineConfig } from 'vite-plus'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  staged: {
    "*": "vp check --fix"
  },
  plugins: [react(), tailwindcss()],
})
