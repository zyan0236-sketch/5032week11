import 'bootstrap/dist/css/bootstrap.min.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { observeAuth } from './stores/auth'

import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCdOO6XZCJCcHEpXixC7Md1rxhUoWIdbuk",
  authDomain: "fit5032-3d110.firebaseapp.com",
  projectId: "fit5032-3d110",
  storageBucket: "fit5032-3d110.firebasestorage.app",
  messagingSenderId: "887276928344",
  appId: "1:887276928344:web:ac37cd7ff89744b7d5f92d"
};













// Initialize Firebase
initializeApp(firebaseConfig);
observeAuth(router)




const app = createApp(App)
app.use(PrimeVue, { theme: { preset: Aura } })
app.use(router)

app.mount('#app')
