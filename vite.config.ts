import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'
  return {
    plugins: [vue()],
    server: {
      host: '0.0.0.0',
      port: 8081,
      hmr: true,
      open: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8089',
          changeOrigin: true
        },
        '/wxapi': {
          target: 'http://localhost:8089',
          changeOrigin: true
        }
      }
    },
    resolve: {
      alias: [
        {
          find: '@',
          replacement: resolve(__dirname, 'src')
        }
      ]
    },
    define: {
      'process.env': {
        BASE_API_IMG: isDev ? '/api' : '',
        BASE_API: isDev ? '' : ''
      }
    },
    build: {
      chunkSizeWarningLimit: 5000
    }
  }
})
