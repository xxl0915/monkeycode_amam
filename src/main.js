import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { bootstrap } from './store'
import './styles/base.css'

createApp(App).use(router).mount('#app')
bootstrap()
