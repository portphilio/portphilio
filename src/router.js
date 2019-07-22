import Vue from 'vue'
import Router from 'vue-router'
import { store, ability } from '@/store'
import TheHomePage from '@/components/pages/TheHomePage'
import TheDashboardPage from '@/components/pages/TheDashboardPage'
import TheHandleAuthPage from '@/components/pages/TheHandleAuthPage'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: TheHomePage,
      meta: {
        icon: 'mdi-home'
      }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import(/* webpackChunkName: "about" */ '@/components/pages/TheAboutPage.vue'),
      meta: {
        icon: 'mdi-information'
      }
    },
    {
      path: '/artifacts',
      name: 'artifacts',
      component: () => import(/* webpackChunkName: "artifacts" */ '@/components/pages/artifacts/TheArtifactsPage.vue'),
      meta: {
        icon: 'mdi-file-document-box-multiple',
        requiresAuthentication: true
      }
    },
    {
      path: '/handle-auth',
      name: 'handle-auth',
      component: TheHandleAuthPage
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: TheDashboardPage,
      meta: {
        icon: 'mdi-view-dashboard',
        requiresAuthentication: true
      }
    }
  ]
})

// this typically only happens when the browser window has been reloaded
const waitForStorageToBeReady = async (to, from, next) => {
  // if the store has not been re-hydrated yet...
  if (!store._vm.$root.$data['storageReady']) {
    // wait for that to happen
    store._vm.$root.$on('storageReady', async () => {
      // if necessary
      if (to.meta.requiresAuthentication) {
        await store.dispatch('auth/enticate')
      }
      // then refresh their capabilities
      ability.update(store.state.auth.abilities)
      // then continue...
      next()
    })
  } else {
    next()
  }
}
router.beforeEach(waitForStorageToBeReady)

export default router
