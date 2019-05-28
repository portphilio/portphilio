/**
 * A store module representing the backend API
 */

import { api } from '@/services/api'
import { SET_API, API_REQUEST, API_SUCCESS, API_FAILURE } from '@/store/mutation-types'

const initialState = {
  api: null,
  currentRequest: {},
  error: null
}

const state = Object.assign({}, initialState)

const mutations = {
  [SET_API] (state, api) {
    state.api = api
  },
  [API_REQUEST] (state, { method, service, params }) {
    state.error = null
    state.currentRequest.method = method
    state.currentRequest.service = service
    state.currentRequest.params = params
  },
  [API_SUCCESS] (state) {
    state.currentRequest = {}
  },
  [API_FAILURE] (state, err) {
    state.currentRequest = {}
    state.error = err
  }
}

const actions = {
  setApi ({ commit }, api) {
    commit(SET_API, api)
  },
  async call ({ commit, state, dispatch }, { method, service, params }) {
    // let the store know we're beginning a request
    commit(API_REQUEST, { method, service, params })
    // make sure we are authenticated
    await dispatch('auth/enticate', null, { root: true })
    // make our api call and handle the result
    return state.api.service(service)[method](...Object.values(params)).then(
      res => {
        commit(API_SUCCESS)
        return res
      },
      err => {
        commit(API_FAILURE, err)
        return state.error
      }
    )
  }
}

const getters = {}

/**
 * A Vuex plugin to subscribe to login/refresh/logout mutations so that
 * the API token can be (re)set, when necessary.
 *
 * @param {Vuex} store The global store
 */
export const setAPIToken = store => {
  store.subscribe(mutation => {
    // listen for mutations that affect the value of auth.accessToken
    if ([
      'auth/LOGIN_SUCCESS',
      'auth/REFRESH_SUCCESS',
      'auth/LOGIN_FAILURE',
      'auth/REFRESH_FAILURE',
      'auth/LOGOUT',
      'RESTORE_MUTATION'
    ].includes(mutation.type)) {
      // get the new access token from auth state
      const token = store.state.auth.accessToken
      // (re)initialize the api or set it to null
      store.dispatch('api/setApi', token ? api(token) : null)
    }
  })
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
