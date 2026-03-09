import { createRouter, createWebHistory } from 'vue-router'
import LockScreen from '../views/LockScreen.vue'
import Home from '../views/Home.vue'
import AddPassword from '../views/AddPassword.vue'
import EditPassword from '../views/EditPassword.vue'
import PasswordGenerator from '../views/PasswordGenerator.vue'
import Settings from '../views/Settings.vue'

const routes = [
  {
    path: '/',
    name: 'LockScreen',
    component: LockScreen
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/add',
    name: 'AddPassword',
    component: AddPassword
  },
  {
    path: '/edit/:id',
    name: 'EditPassword',
    component: EditPassword
  },
  {
    path: '/generator',
    name: 'PasswordGenerator',
    component: PasswordGenerator
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router