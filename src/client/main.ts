import { createApp } from 'vue'
import FloatingVue from 'floating-vue'
import '@unocss/reset/tailwind.css'
import '@vue/devtools-ui/style.css'
import 'floating-vue/dist/style.css'
import 'uno.css'
import App from './App.vue'

const app = createApp(App)
app.use(FloatingVue)
app.mount('#app')
