import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import knipUi from 'vite-plugin-knip-ui'

export default defineConfig({
  plugins: [vue(), knipUi()],
})
