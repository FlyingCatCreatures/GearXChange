import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Home from './pages/Home.vue'
import About from './pages/About.vue'
import Login from './pages/Login.vue'
import SignUp from './pages/SignUp.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/login', component: Login },
  { path: '/signup', component: SignUp },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
