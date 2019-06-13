/**
 * A store module representing the backend API
 */

import { appApi } from '@/services/api'
import { SET_API_TOKEN, API_REQUEST, API_SUCCESS, API_FAILURE } from '@/store/mutation-types'

// local instantiation of our feathers API that gets
// (re)initialized whenever the token is set
let api

const initialState = {
  token: null,
  currentRequest: {},
  error: null
}

const state = Object.assign({}, initialState)

const mutations = {
  [SET_API_TOKEN] (state, token) {
    state.token = token
    api = token ? appApi(token) : null
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
  setToken ({ commit }, token) {
    commit(SET_API_TOKEN, token)
  },
  async call ({ commit, state, dispatch }, { method, service, params }) {
    // let the store know we're beginning a request
    commit(API_REQUEST, { method, service, params })
    // make sure we are authenticated
    await dispatch('auth/enticate', null, { root: true })
    // make our api call and handle the result
    return api.service(service)[method](...Object.values(params)).then(
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
      // save it in the store
      store.dispatch('api/setToken', token)
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
