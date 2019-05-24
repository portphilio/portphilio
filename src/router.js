import Vue from 'vue'
import Router from 'vue-router'
import { store, ability } from '@/store'
import Home from './views/Home.vue'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: {
        icon: 'mdi-home'
      }
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue'),
      meta: {
        icon: 'mdi-information'
      }
    }
  ]
})

const waitForStorageToBeReady = (to, from, next) => {
  if (!store._vm.$root.$data['vuexPersistStateRestored']) {
    store._vm.$root.$on('vuexPersistStateRestored', () => {
      // restore abilities on page reload
      ability.update(store.state.auth.abilities)
      next()
    })
  } else {
    next()
  }
}
router.beforeEach(waitForStorageToBeReady)

export default router
