import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import AddBookView from '@/views/AddBookView.vue'
import FirebaseSigninView from '@/views/FirebaseSigninView.vue'
import FirebaseRegisterView from '@/views/FirebaseRegisterView.vue'
import AdminView from '@/views/AdminView.vue'
import MemberView from '@/views/MemberView.vue'
import { dashboardPath, getRole, waitForAuth } from '@/stores/auth'

const routes = [
  {
    path: '/admin',
    name: 'Admin',
    component: AdminView,
    meta: { role: 'Admin' }
  },
  {
    path: '/member',
    name: 'Member',
    component: MemberView,
    meta: { role: 'User' }
  },
  {
    path: '/addbook',
    name: 'AddBook',
    component: AddBookView
  },
  {
    path: '/FireLogin',
    name: 'FireLogin',
    component: FirebaseSigninView,
    meta: { guestOnly: true }
  },
  {
    path: '/FireRegister',
    name: 'FireRegister',
    component: FirebaseRegisterView,
    meta: { guestOnly: true }
  },
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'About',
    component: AboutView
  }
  
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  const user = await waitForAuth()
  if (to.meta.role) {
    if (!user) return '/FireLogin'
    if (getRole(user) !== to.meta.role) return dashboardPath(user)
  }
  if (to.meta.guestOnly && user) return dashboardPath(user)
})

export default router
