/**
 * A store module to manage common app-wide state
 */
import { TOGGLE_NAV_DRAWER_MINI } from '@/store/mutation-types'

const initialState = {
  navDrawerIsMini: false
}

const state = Object.assign({}, initialState)

const mutations = {
  [TOGGLE_NAV_DRAWER_MINI] (state) {
    state.navDrawerIsMini = !state.navDrawerIsMini
  }
}

const actions = {
  toggleNavDrawerMini ({ commit, state }) {
    commit(TOGGLE_NAV_DRAWER_MINI)
    return state.navDrawerIsMini
  }
}

const getters = {}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
