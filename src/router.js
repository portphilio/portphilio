/* istanbul ignore file */
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
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import(/* webpackChunkName: "artifacts" */ '@/components/pages/TheProfilePage.vue'),
      meta: {
        icon: 'mdi-account-box',
        requiresAuthentication: true
      }
    }
  ]
})

/**
 * This route hook forces the RESTORE_MUTATION to be the first one to
 * execute on a page load. It allows the app state to be recovered
 * from storage before applying any queued actions or mutations.
 *
 * @param {Route}    to   The route to which the user is headed
 * @param {Route}    from The route from which the user is coming
 * @param {Function} next Callback that signals it's okay to proceed
 */
const waitForStorageToBeReady = async (to, from, next) => {
  // if the store has not been re-hydrated yet...
  if (!store._vm.$root.$data['storageReady']) {
    // wait for that to happen
    store._vm.$root.$on('storageReady', async () => {
      // if necessary
      if (to.meta.requiresAuthentication) {
        await store.dispatch('auth/checkSession')
      }
      // then refresh their abilities
      ability.update(store.state.auth.abilities || [])
      // then continue...
      next()
    })
  } else {
    next()
  }
}
router.beforeEach(waitForStorageToBeReady)

export default router
