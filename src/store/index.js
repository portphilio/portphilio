import Vue from 'vue'
import Vuex from 'vuex'
import localforage from 'localforage'
import VuexPersistence from 'vuex-persist'
import auth from '@/store/modules/auth'
import api, { setAPIToken } from '@/store/modules/api'
import common from '@/store/modules/common'
import { abilityPlugin, ability as appAbility } from '@/store/abilities'

Vue.use(Vuex)

export const ability = appAbility

const debug = process.env.NODE_ENV !== 'production'

const local = new VuexPersistence({
  key: 'sc_vuex',
  storage: localforage,
  strictMode: debug,
  modules: [
    'auth',
    'common'
  ]
})

export const store = new Vuex.Store({
  strict: debug,
  modules: {
    auth,
    api,
    common
  },
  mutations: {
    RESTORE_MUTATION: local.RESTORE_MUTATION
  },
  plugins: [local.plugin, setAPIToken, abilityPlugin]
})
