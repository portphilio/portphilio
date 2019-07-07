import Vue from 'vue'
import Vuex from 'vuex'
import localforage from 'localforage'
import VuexPersistence from 'vuex-persist'
import { api as appAPI, FeathersVuex } from '@/services/api'
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
const local = new VuexPersistence({
  key: 'portphilio_vuex',
  asyncStorage: true,
  storage: localforage,
  strictMode: true // always set to true to use RESTORE_MUTATION
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

// plugin to handle when the access_token changes
const updateAccessToken = () => {
  return store => {
    store.subscribe(mutation => {
      if ([
        'auth/LOGIN_SUCCESS',
        'auth/REFRESH_SUCCESS',
        'auth/LOGIN_FAILURE',
        'auth/REFRESH_FAILURE',
        'auth/LOGOUT',
        'RESTORE_MUTATION'
      ].includes(mutation.type)) {
        // get the value of the access_token from the auth state
        const token = store.state.auth.accessToken
        // update our API settings to use the access_token for REST
        // appAPI.rest.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : null
        // also re-establish the websocket connection with the new token
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
    RESTORE_MUTATION: local.RESTORE_MUTATION
  },
  plugins: [
    ...apiPlugins,
    local.plugin,
    handleRestore(),
    updateAccessToken(),
    abilityPlugin
  ]
})
