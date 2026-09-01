import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

// https://vite.dev/config/
// GitHub Pages requiere la base con el nombre exacto del repositorio.
export default defineConfig({
  base: '/vue_celulares/',
  plugins: [
    vue({ template: { transformAssetUrls } }),
    quasar(),
  ],
})
