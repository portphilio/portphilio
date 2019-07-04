/**
 * A store module to manage authentication-related state
 *
 * @module store/auth
 */
// for decoding JWTs
import jws from 'jws'

// mutation types
import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  REFRESH_REQUEST,
  REFRESH_SUCCESS,
  REFRESH_FAILURE,
  GOOGLE_TOKEN_REQUEST,
  GOOGLE_TOKEN_SUCCESS,
  GOOGLE_TOKEN_FAILURE,
  LOGOUT
} from '@/store/mutation-types'

// get access to the api
import { api } from '@/store'

// factory function to create auth0.WebAuth instance
import { createAuth } from '@/services/auth0'

// works with the appAbility plugin to define user capabilities
import { defineAbilitiesFor } from '@/store/abilities'

// used to specify namespaced scopes for additional auth0 functions
const ns = process.env.VUE_APP_AUTH0_NAMESPACE

/**
 * A local instance of {@link module:services/auth0}
 * @private
 */
const auth = createAuth({
  domain: process.env.VUE_APP_AUTH0_DOMAIN,
  clientID: process.env.VUE_APP_AUTH0_CLIENT_ID,
  redirectUri: process.env.VUE_APP_AUTH0_REDIRECT_URI,
  audience: process.env.VUE_APP_AUTH0_AUDIENCE,
  scope: `openid profile email ${ns}roles ${ns}google ${ns}api_id`
})

/**
 * Auth0 identity info maintained for each identity provider
 * @see {@link https://openid.net/specs/openid-connect-core-1_0.html#AddressClaim|OpenID Connect Implementer's Guide}
 *
 * @typedef  {Object}  Identity
 * @property {string}  user_id        - The user_id issued by the idP
 * @property {string}  provider       - The name of the idP, e.g. auth0, google-oauth2, github, etc.
 * @property {string}  connection     - The type of connection, frequently same as the provider
 * @property {boolean} isSocial       - Is the provider a 3rd party, e.g. Google, GitHub, etc.
 * @property {string}  [access_token] - An API access token associated with the idP
 * @property {number}  [expires_in]   - The number of seconds until the access_token expires
 */

/**
 * The Default Auth State
 *
 * This object defines all properties that concern the login
 * status of the user, as well as permissions and access to external
 * resources like the app API, Google API, etc. All non-derived values
 * should be stored on and retrieved from Auth0's servers. A great
 * deal of the app state relies on the values of these variables.
 *
 * @namespace
 * @private
 * @property {object}   abilities        - An object controlling what actions this user is capable of performing in this app
 * @property {string}   accessToken      - The Auth0 accessToken needed to make API calls
 * @property {string}   apiId            - The _id associated with this user in the backend API (feathers)
 * @property {object}   error            - An object describing why actions for this module may have failed
 * @property {number}   expiresAt        - A unix timestamp indicating when the {@link initialState.accessToken} expires
 * @property {string}   googleToken      - The Google API access_token associated with this user
 * @property {number}   googleExpiry     - A timestamp indicating when the Google API access_token will expire
 * @property {string}   idToken          - A {@link https://jwt.io/|JWT} containing the user profile
 * @property {boolean}  isAuthenticating - Is the user currently in the login process?
 * @property {boolean}  isUpdating       - Are we currently updating the user metadata?
 * @property {number}   issuedAt         - A unix timestamp indicating when the {@link initialState.accessToken} was issued
 * @property {string[]} roles            - An array of strings indicating roles held by this user in this app
 * @property {string}   user_id          - The unique Auth0 user id used for retrieving/updating user metadata
 */
const initialState = {
  abilities: null,
  accessToken: null,
  apiId: null,
  error: null,
  expiresAt: null,
  googleToken: null,
  googleExpiry: null,
  idToken: null,
  isAuthenticating: false,
  isUpdating: false,
  issuedAt: null,
  roles: [],
  user_id: null
}

// initialize module state
const state = { ...initialState }

const mutations = {
  [LOGIN_REQUEST] (state) {
    state.isAuthenticating = true
  },
  [LOGIN_SUCCESS] (state, { accessToken, idToken, idTokenPayload }) {
    const accessTokenPayload = jws.decode(accessToken).payload
    state.roles = idTokenPayload[ns + 'roles'] || []
    state.abilities = defineAbilitiesFor(state.roles)
    state.accessToken = accessToken
    state.apiId = idTokenPayload[ns + 'api_id'] || null
    state.error = null
    state.expiresAt = accessTokenPayload.exp * 1000
    state.googleToken = idTokenPayload[ns + 'google'] || null
    state.googleExpiry = (idTokenPayload.iat + 3600) * 1000 // one hour after the Auth0 token was issued
    state.idToken = idToken
    state.issuedAt = accessTokenPayload.iat * 1000
    state.user_id = idTokenPayload.sub
    state.isAuthenticating = false
  },
  [LOGIN_FAILURE] (state, err) {
    Object.assign(state, initialState, { error: err })
  },
  [REFRESH_REQUEST] (state) {
    state.isAuthenticating = true
  },
  [REFRESH_SUCCESS] (state, { accessToken, idTokenPayload }) {
    const accessTokenPayload = jws.decode(accessToken).payload
    state.accessToken = accessToken
    state.error = null
    state.expiresAt = accessTokenPayload.exp * 1000
    state.isAuthenticating = false
  },
  [REFRESH_FAILURE] (state, err) {
    Object.assign(state, initialState, { error: err })
  },
  [GOOGLE_TOKEN_REQUEST] (state) {
    state.isAuthenticating = true
  },
  [GOOGLE_TOKEN_SUCCESS] (state, { accessToken, expiresAt } = {}) {
    // update if new values passed
    if (accessToken && expiresAt) {
      state.googleToken = accessToken
      state.googleExpiry = expiresAt * 1000
    }
    state.error = null
    state.isAuthenticating = false
  },
  [GOOGLE_TOKEN_FAILURE] (state, err) {
    console.error(err)
    state.googleToken = null
    state.googleExpiry = null
    state.error = err.message
    state.isAuthenticating = false
  },
  [LOGOUT] (state) {
    Object.assign(state, initialState)
  }
}

const actions = {
  /**
   * auth/enticate determines if a user is currently logged-in,
   * not-logged-in, or has logged-in, but has an expired token,
   * then it dispatches the appropriate actions, if needed.
   *
   * @param  {Object}   options.state    The auth state of the app
   * @param  {Function} options.dispatch Function to dispatch actions
   * @return {Promise}                   So calling scope can react
   */
  enticate ({ state, dispatch }) {
    const now = new Date().getTime()
    // already logged-in?
    if (state.expiresAt && now < state.expiresAt - 5000) {
      return Promise.resolve('ok')
    }
    // need to refresh?
    if (state.expiresAt && now >= state.expiresAt - 5000) {
      return dispatch('refresh')
    }
    // fresh login needed
    return dispatch('login')
  },

  /**
   * Start the login process, i.e. redirect to the Auth0 login page
   *
   * @param {Function}      options.commit Function to commit mutations
   */
  login ({ commit }) {
    commit(LOGIN_REQUEST)
    auth.login({ api_url: process.env.VUE_APP_API_URL })
  },

  /**
   * Handle the login process, i.e. parse the response from Auth0
   * and commit mutations to update the state accordingly.
   *
   * @param {Function} options.commit   Function to commit mutations
   * @param {Function} options.dispatch Function to dispatch other actions
   */
  handle ({ commit, dispatch }) {
    return auth.handle().then(
      // login completed successfully
      res => commit(LOGIN_SUCCESS, res),
      // login failed :(
      err => commit(LOGIN_FAILURE, err)
    )
  },

  /**
   * Gets a new access token for the currently logged in user and/or
   * updates the access token with an appropriate scope and audience
   * to use the auth0.Management API.
   *
   * @param {Function} options.commit Function to commit mutations
   */
  refresh ({ commit }) {
    commit(REFRESH_REQUEST)
    return auth
      .checkSession()
      .then(
        res => commit(REFRESH_SUCCESS, res),
        err => commit(REFRESH_FAILURE, err)
      )
  },

  async getGoogleToken ({ state, commit, dispatch }) {
    commit(GOOGLE_TOKEN_REQUEST)
    const now = new Date().getTime()
    // already have an unexpired token?
    if (state.googleToken && state.googleExpiry && now < state.googleExpiry - 30000) {
      commit(GOOGLE_TOKEN_SUCCESS)
    } else {
      await dispatch('enticate')
      return api.service('tokens')
        .update(state.user_id, {})
        .then(
          token => commit(GOOGLE_TOKEN_SUCCESS, token),
          error => commit(GOOGLE_TOKEN_FAILURE, error)
        )
    }
  },

  /**
   * Log the user out. Returns them to the login screen.
   *
   * @param {Function} options.commit Function to commit mutations
   */
  logout ({ commit, dispatch }, returnTo = null) {
    commit(LOGOUT)
    dispatch('user/clearProfile', null, { root: true })
    auth.logout(returnTo)
  }
}

const getters = {
  isAuthenticated: state => state.expiresAt && new Date().getTime() < state.expiresAt
}

/**
 * Finally, export the module
 */
export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
