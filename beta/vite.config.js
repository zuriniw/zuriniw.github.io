import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    open: '/beta.html'
  },
  build: {
    rollupOptions: {
      input: './beta.html'
    }
  }
})
