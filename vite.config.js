import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

export default defineConfig({
  base: '/vue_celulares/',
  plugins: [
    vue({ template: { transformAssetUrls } }),
    quasar(),
  ],
})
