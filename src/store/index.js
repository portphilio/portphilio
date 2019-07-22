import Vue from 'vue'
import Vuex from 'vuex'
import localforage from 'localforage'
import setupPersistence from './persistence'
import { api as appAPI, auth0Plugin, FeathersVuex, models } from '@/services/api'
import { abilityPlugin, ability as appAbility } from '@/store/abilities'
// import artifacts from '@/store/modules/artifacts'
import auth from '@/store/modules/auth'
import common from '@/store/modules/common'
import user from '@/store/modules/user'

// register Vue plugins
Vue.use(Vuex)
Vue.use(FeathersVuex)

// passthrough export of key objects
export const ability = appAbility
export const api = appAPI

// get the API service plugins
const requireModule = require.context('@/store/services', false, /.js$/)
const apiPlugins = requireModule.keys().map(path => requireModule(path).default)

// setup persistent local storage for the store modules
const persistence = setupPersistence({
  key: 'portphilio_vuex',
  feathersModels: models.api.byServicePath,
  storage: localforage
})

// plugin to handle when store has been restored
const handleRestore = () => {
  return store => {
    store._vm.$root.$data['storageReady'] = false
    store.subscribe(mutation => {
      if (mutation.type === 'RESTORE_MUTATION') {
        store._vm.$root.$data['storageReady'] = true
        store._vm.$root.$emit('storageReady')
      }
    })
  }
}

export const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  modules: {
    // artifacts,
    auth,
    common,
    user
  },
  mutations: {
    RESTORE_MUTATION: persistence.RESTORE_MUTATION
  },
  // TODO: Figure out if order matters here, and if so, what it should be
  plugins: [
    persistence.plugin,
    handleRestore(),
    abilityPlugin,
    auth0Plugin(),
    ...apiPlugins
  ]
})
