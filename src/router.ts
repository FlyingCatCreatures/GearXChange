import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Home from './pages/Home.vue'
import About from './pages/About.vue'
import SignUp from './pages/SignUp.vue'
import UnImplemented from './pages/UnImplemented.vue'
import History from './pages/History.vue';
import Rent from './pages/Rent.vue';
import Sell from './pages/Sell.vue';

const routes: RouteRecordRaw[] = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/signup', component: SignUp },
  { path: '/sell', component: Sell },
  { path: '/rent', component: Rent },
  { path: '/fav', component: UnImplemented },
  { path: '/hist', component: History },
  { path: '/prof', component: UnImplemented },
  { path: '/sett', component: UnImplemented },

]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
