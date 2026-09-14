import './Firebase/init.js'
import 'bootstrap/dist/css/bootstrap.min.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { observeAuth } from './stores/auth'

import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'


observeAuth(router)




const app = createApp(App)
app.use(PrimeVue, { theme: { preset: Aura } })
app.use(router)

app.mount('#app')
