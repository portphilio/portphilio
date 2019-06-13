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
  key: 'portphilio_vuex',
  asyncStorage: true,
  storage: localforage,
  strictMode: true, // always set to true to use RESTORE_MUTATION
  modules: [
    'auth',
    'common'
  ]
})

// plugin to handle when store has been restored
// const handleRestore = () => {
//   return store => {
//     store.subscribe(mutation => {
//       if (mutation.type === 'RESTORE_MUTATION') {
//         // restore @casl/ability settings
//         console.log('restored', ability, store)
//         ability.update(store.state.auth.abilities)
//       }
//     })
//   }
// }

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
