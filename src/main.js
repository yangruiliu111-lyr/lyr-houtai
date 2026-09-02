import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import './styles/global.css'

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus)
app.use(router)

app.config.errorHandler = (err, vm, info) => {
  const msg = err instanceof Error ? (err.message + '\n' + (err.stack || '').split('\n').slice(0,3).join('\n')) : String(err)
  console.error('Vue Error:', err)
  document.body.innerHTML += '<div style="position:fixed;top:0;left:0;right:0;background:red;color:#fff;padding:12px 16px;z-index:99999;font-size:12px;white-space:pre-wrap;max-height:200px;overflow:auto">Vue Error: ' + msg + '</div>'
}

app.mount('#app')
