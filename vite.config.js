import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

export default defineConfig({
  // Render sirve en la raíz del dominio; GitHub Pages necesita el subpath del repo.
  base: process.env.RENDER ? '/' : '/vue_celulares/',
  plugins: [
    vue({ template: { transformAssetUrls } }),
    quasar(),
  ],
})
