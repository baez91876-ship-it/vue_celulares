import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { Quasar, Notify } from 'quasar'
import 'quasar/dist/quasar.css'
import '@quasar/extras/material-icons/material-icons.css'

createApp(App)
	.use(Quasar, { plugins: { Notify } })
	.mount('#app')
