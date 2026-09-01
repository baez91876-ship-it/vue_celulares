import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

// https://vite.dev/config/
// Para GitHub Pages: cambiar base a '/taller-servicios/' (nombre del repo)
// Para Vercel/Render: mantener base en '/'
export default defineConfig({
  base: '/',  // Cambiar a '/tu-repo-name/' si despliega en GitHub Pages
  plugins: [
    vue({ template: { transformAssetUrls } }),
    quasar(),
  ],
})
