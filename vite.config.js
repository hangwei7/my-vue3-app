import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  // 所有以 /api 开头的请求将被转发到 http://localhost:48080，并移除路径中的 /api 前缀。
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:48080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
