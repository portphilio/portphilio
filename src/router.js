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
        icon: 'mdi-file-document-box-multiple'
      }
    },
    {
      path: '/artifacts/new',
      name: 'new artifact',
      component: () => import(/* webpackChunkName: "artifacts" */ '@/components/pages/artifacts/TheNewArtifactPage.vue'),
      meta: {
        icon: 'mdi-file-document-box-multiple'
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
        icon: 'mdi-view-dashboard'
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
