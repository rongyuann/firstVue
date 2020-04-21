import Vue from 'vue'
import VueRouter from 'vue-router'

import Login from '../components/Login'
import Home from '../components/Home'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home
  }
]

const router = new VueRouter({
  routes
})

// 为路由对象添加beforeEach导航守卫
router.beforeEach((to, from, next) => {
  // 若访问登录页，直接放行
  if (to.path === '/login') {
    return next()
  } else {
    // 从sessionStorage获取保存的token值
    const tokenStr = window.sessionStorage.getItem('token')
    if (!tokenStr) {
      // 无token，强制跳转到登录页
      return next('/login')
    }
    next()
  }
})

export default router
