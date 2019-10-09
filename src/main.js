/* istanbul ignore file */
import Vue from 'vue'
import { abilitiesPlugin, Can } from '@casl/vue'
import LoadScript from 'vue-plugin-load-script'
import VueOffline from 'vue-offline'
import VueInstall from 'vue-pwa-install'
import vuetify from '@/plugins/vuetify'
import App from '@/App.vue'
import '@/analytics'
import router from '@/router'
import { store, ability } from '@/store/'
import '@/registerServiceWorker'
import i18n from '@/i18n'

Vue.config.productionTip = false
Vue.use(abilitiesPlugin, ability)
Vue.component('can', Can)
Vue.use(LoadScript)
Vue.use(VueOffline, { mixin: false, storage: false })
Vue.use(VueInstall)

new Vue({
  router,
  store,
  i18n,
  vuetify,
  render: h => h(App)
}).$mount('#app')
