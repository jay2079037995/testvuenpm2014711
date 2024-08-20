import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './registerServiceWorker'
import '@icon-park/vue-next/styles/index.css'
import 'prosemirror-view/style/prosemirror.css'
import 'animate.css'
import '@/assets/styles/prosemirror.scss'
import '@/assets/styles/global.scss'
import '@/assets/styles/font.scss'

import Icon from '@/plugins/icon'
import Directive from '@/plugins/directive'

import i18n from '@/assets/locales/index'
import svgIcons from '@/assets/icons'
import { yjxInit } from '@/utils/yjs-init'
import { parseQueryString } from './utils/query'
import router from './router'

// const debounce = (fn: any, delay: any) => {
//   let timer: any
//   return (...args: any) => {
//     if (timer) {
//       clearTimeout(timer)
//     }
//     timer = setTimeout(() => {
//       fn(...args)
//     }, delay)
//   }
// }
// const resizeObserver = window.ResizeObserver
// window.ResizeObserver = class ResizeObserver extends resizeObserver {
//   constructor(callback: any) {
//     callback = debounce(callback, 200)
//     super(callback)
//   }
// }



const addYJS = parseQueryString().yjs ? true : false

const app = createApp(App)

function onYJSReady() {
  app.mount('#app')
  app.config.globalProperties.$t = i18n.global.t // 挂载到全局，DOM上能使用$t使用
}

svgIcons(app)
app.use(Icon)
app.use(Directive)
// 国际化
app.use(i18n)
app.use(createPinia())
app.use(router)

if (addYJS) {
  yjxInit(onYJSReady)
}
else {
  app.mount('#app')
  app.config.globalProperties.$t = i18n.global.t // 挂载到全局，DOM上能使用$t使用
}

