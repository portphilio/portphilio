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
      path: '/artifacts/:id',
      name: 'add/edit artifact',
      component: () => import(/* webpackChunkName: "artifacts" */ '@/components/pages/artifacts/TheEditArtifactPage.vue'),
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

let previouslyRestored = false
const waitForStorageToBeReady = async (to, from, next) => {
  await store.restored
  if (!previouslyRestored) {
    ability.update(store.state.auth.abilities)
    previouslyRestored = true
  }
  next()
}
router.beforeEach(waitForStorageToBeReady)

export default router
