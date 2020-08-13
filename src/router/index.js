import Vue from 'vue'
import Router from 'vue-router'

import { checkAccessMiddleware } from './middlewares'
import { routes } from './routes'

Vue.use(Router)

const router = new Router({
  linkActiveClass: 'is-active',
  mode: 'history',
  routes
})

router.beforeEach(checkAccessMiddleware)

export default router
