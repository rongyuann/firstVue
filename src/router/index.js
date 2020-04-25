import Vue from 'vue'
import VueRouter from 'vue-router'

import Login from '../components/Login'
import Home from '../components/Home'
import Welcome from '../components/Welcome'
import Users from '../components/user/Users'
import Roles from '../components/power/Roles'
import Rights from '../components/power/Rights'
import Category from '../components/goods/Category'
import Params from '../components/goods/Params'
import List from '../components/goods/List'
import Add from '../components/goods/Add'

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
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/roles', component: Roles },
      { path: '/rights', component: Rights },
      { path: '/categories', component: Category },
      { path: '/params', component: Params },
      { path: '/goods', component: List },
      { path: '/goods/add', component: Add }]
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
