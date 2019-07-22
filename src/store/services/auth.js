// for decoding JWTs and serializing errors
import jws from 'jwt-decode'
import serializeError from 'serialize-error'

import { api, makeAuthPlugin, models } from '@/services/api'

// factory function to create auth0.WebAuth instance
import { createAuth0Client } from '@/services/auth0'

// works with the appAbility plugin to define user capabilities
import { ability, defineAbilitiesFor } from '@/store/abilities'

// used to specify namespaced scopes for additional auth0 functions
const ns = process.env.VUE_APP_AUTH0_NAMESPACE

/**
 * A local instance of {@link module:services/auth0}
 * @private
 */
const auth0 = createAuth0Client({
  audience: process.env.VUE_APP_AUTH0_AUDIENCE,
  clientID: process.env.VUE_APP_AUTH0_CLIENT_ID,
  domain: process.env.VUE_APP_AUTH0_DOMAIN,
  redirectUri: process.env.VUE_APP_AUTH0_REDIRECT_URI,
  scope: `openid profile email ${ns}google`
})

export default makeAuthPlugin({
  userService: 'users',
  state: {
    abilities: [],
    entityIdField: 'user_id',
    errorOnGoogleTokenRefresh: null,
    errorOnLogin: null,
    errorOnRefresh: null,
    expiresAt: null,
    googleExpiry: null,
    googleToken: null,
    isGoogleTokenRefreshPending: false,
    isLoginPending: false,
    isRefreshPending: false
  },
  actions: {
    login: ({ commit, state }) => {
      commit('setLoginPending')
      if (state.errorOnLogin) commit('clearLoginError')
      auth0.login({ api_url: process.env.VUE_APP_API_URL })
    },
    handleLogin: async ({ commit, dispatch }) => {
      try {
        // extract values
        const { accessToken, idTokenPayload } = await auth0.handle()
        const accessTokenPayload = jws(accessToken)
        // set auth service data in the store
        commit('setAccessToken', accessToken)
        commit('setPayload', accessTokenPayload)
        commit('setExpiresAt', accessTokenPayload.exp * 1000)
        commit('setGoogleToken', idTokenPayload[`${ns}google`] || null)
        // Google access token expires 1 hour after login
        commit('setGoogleExpiry', (idTokenPayload.iat + 3600) * 1000)
        commit('unsetLoginPending')
        dispatch('authenticate', { strategy: 'auth0', accessToken })
      } catch (error) {
        commit('setLoginError', error)
        commit('unsetLoginPending')
      }
    },
    responseHandler: async ({ commit, state }, response) => {
      // if the current user has not been set already
      if (!state.user) {
        // extract key values from the response
        const user = response[state.responseEntityField]
        const User = models.api.byServicePath[state.userService]
        commit('setUser', new User(user))
        // update the user's permissions for this session
        const abilities = defineAbilitiesFor(user.app_metadata.roles, user._id)
        commit('setAbilities', abilities)
        ability.update(abilities)
      }
      commit('unsetAuthenticatePending')
    },
    logout: async ({ commit }) => {
      commit('setLogoutPending')
      // clear data from all models
      for (let model in models.api.byServicePath) {
        if (!['auth', 'undefined'].includes(model)) {
          commit(`${model}/clearAll`, null, { root: true })
        }
      }
      // logout of the API
      await api.logout()
      commit('logout')
      commit('unsetLogoutPending')
      // logout of Auth0 (triggers redirect)
      await auth0.logout(process.env.VUE_APP_AUTH0_LOGOUT_URI)
    },
    checkSession: async ({ commit, dispatch, state }) => {
      commit('setRefreshPending')
      const now = new Date().getTime()
      // check login status
      if (state.expiresAt && now < state.expiresAt - 5000) {
        // already logged in
        api.reAuthenticate()
        commit('unsetRefreshPending')
      } else if (state.expiresAt && now >= state.expiresAt - 5000) {
        // we need to refresh the session
        commit('clearRefreshError')
        try {
          const { accessToken } = await auth0.checkSession()
          const payload = jws(accessToken)
          commit('setAccessToken', accessToken)
          commit('setPayload', payload)
          commit('setExpiresAt', payload.exp * 1000)
          await api.authenticate({ strategy: 'auth0', accessToken })
          commit('unsetRefreshPending')
        } catch (error) {
          commit('setRefreshError', error)
          commit('unsetRefreshPending')
        }
      } else {
        // fresh login needed
        commit('unsetRefreshPending')
        dispatch('login')
      }
    },
    getGoogleToken: async ({ state, commit, dispatch }) => {
      commit('setGoogleTokenRefreshPending')
      const now = new Date().getTime()
      if (state.googleToken && state.googleExpiry && now < state.googleExpiry - 20000) {
        commit('unsetGoogleTokenRefreshPending')
        return state.googleToken
      } else {
        commit('clearGoogleTokenRefreshError')
        try {
          await dispatch('checkSession')
          const result = await api.service('tokens').update(state.user.user_id)
          commit('setGoogleToken', result.accessToken)
          commit('setGoogleExpiry', result.expiresAt)
          commit('unsetGoogleTokenRefreshPending')
          return state.googleToken
        } catch (error) {
          commit('setGoogleTokenRefreshError', error)
          commit('unsetGoogleTokenRefreshPending')
        }
      }
    }
  },
  getters: {
    accessToken: state => state.accessToken,
    googleToken: state => state.googleToken,
    googleTokenIsExpired: state => state.googleExpiry && new Date().getTime() >= state.googleExpiry,
    isAuthenticated: state => state.expiresAt && new Date().getTime() < state.expiresAt,
    isExpired: state => state.expiresAt && new Date().getTime() >= state.expiresAt
  },
  mutations: {
    setLoginPending: state => {
      state.isLoginPending = true
    },
    unsetLoginPending: state => {
      state.isLoginPending = false
    },
    setLoginError: (state, error) => {
      state.errorOnLogin = Object.assign({}, serializeError(error))
    },
    clearLoginError: (state) => {
      state.errorOnLogin = null
    },
    setGoogleTokenRefreshPending: state => {
      state.isGoogleTokenRefreshPending = true
    },
    unsetGoogleTokenRefreshPending: state => {
      state.isGoogleTokenRefreshPending = false
    },
    setGoogleTokenRefreshError: (state, error) => {
      state.errorOnGoogleTokenRefresh = Object.assign({}, serializeError(error))
    },
    clearGoogleTokenRefreshError: (state) => {
      state.errorOnGoogleTokenRefresh = null
    },
    setRefreshPending: state => {
      state.isRefreshPending = true
    },
    unsetRefreshPending: state => {
      state.isRefreshPending = false
    },
    setRefreshError: (state, error) => {
      state.errorOnRefresh = Object.assign({}, serializeError(error))
    },
    clearRefreshError: (state) => {
      state.errorOnRefresh = null
    },
    setAbilities: (state, abilities) => {
      state.abilities = abilities
    },
    setExpiresAt: (state, expiresAt) => {
      state.expiresAt = expiresAt
    },
    setGoogleToken: (state, googleToken) => {
      state.googleToken = googleToken
    },
    setGoogleExpiry: (state, googleExpiry) => {
      state.googleExpiry = googleExpiry
    },
    logout: state => {
      state.payload = null
      state.accessToken = null
      if (state.user) state.user = null
      state.abilities = []
      state.expiresAt = null
      state.googleToken = null
      state.googleExpiry = null
      ability.update([])
    }
  }
})
