import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import Home from './views/Editor/AICreateSelect/CreateSelectMethod.vue'
import SelectInput from './views/Editor/AICreateSelect/CreateSelectInput.vue'
import InputGenerateOutline from './views/Editor/AICreateSelect/CreateInputGenerateOutline.vue'
import SelectFile from './views/Editor/AICreateSelect/CreateSelectImport.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },

  {
    path: '/SelectInput',
    name: 'SelectInput',
    component: SelectInput
  },
  {
    path: '/InputGenerateOutline',
    name: 'InputGenerateOutline',
    component: InputGenerateOutline
  },

  {
    path: '/SelectFile',
    name: 'SelectFile',
    component: SelectFile
  },
  {
    path: '/FileGenerateOutline',
    name: 'FileGenerateOutline',
    component: InputGenerateOutline
  },
  
]
 
const router = createRouter({
  // history: createWebHistory(),
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  next()
})
 
export default router