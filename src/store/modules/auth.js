/**
 * A store module to manage authentication-related state
 *
 * @module store/auth
 */
// utility for merging state objects
import merge from 'deepmerge'

// mutation types
import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  REFRESH_REQUEST,
  REFRESH_SUCCESS,
  REFRESH_FAILURE,
  LOGOUT,
  PROFILE_REQUEST,
  PROFILE_SUCCESS,
  PROFILE_FAILURE,
  PROFILE_UPDATE_REQUEST,
  PROFILE_UPDATE_SUCCESS,
  PROFILE_UPDATE_FAILURE
} from '@/store/mutation-types'

// factory function to create auth0.WebAuth instance
import { createAuth } from '@/services/auth0'

// works with the appAbility plugin to define user capabilities
import { defineAbilitiesFor } from '@/store/abilities'

// options that instruct merge to overwrite arrays
const overwrite = { arrayMerge: (a, b) => b }

// used to specify namespaced scopes for additional auth0 functions
const ns = process.env.VUE_APP_AUTH0_NAMESPACE

// scopes required to update user_metadata in auth0
const privs =
  'read:current_user create:current_user_metadata update:current_user_metadata'

/**
 * A local instance of {@link module:services/auth0}
 * @private
 */
const auth = createAuth({
  domain: process.env.VUE_APP_AUTH0_DOMAIN,
  clientID: process.env.VUE_APP_AUTH0_CLIENT_ID,
  redirectUri: process.env.VUE_APP_AUTH0_REDIRECT_URI,
  audience: process.env.VUE_APP_AUTH0_AUDIENCE,
  scope: `openid profile email ${ns}roles ${privs}`
})

/**
 * Auth0 identity info maintained for each identity provider
 * @see {@link https://openid.net/specs/openid-connect-core-1_0.html#AddressClaim|OpenID Connect Implementer's Guide}
 *
 * @typedef  {Object}  Identity
 * @property {string}  user_id    - May contain multiple lines, e.g. \n
 * @property {string}  provider   - The city
 * @property {string}  connection - The state, province, prefecture, etc.
 * @property {boolean} isSocial   - Zip code
 */

/**
 * OIDC-compliant address type definition
 * @see {@link https://openid.net/specs/openid-connect-core-1_0.html#AddressClaim|OpenID Connect Implementer's Guide}
 *
 * @typedef  {Object} Address
 * @property {string} street_address - May contain multiple lines, e.g. \n
 * @property {string} locality       - The city
 * @property {string} region         - The state, province, prefecture, etc.
 * @property {string} postal_code    - Zip code
 * @property {string} country        - 2-letter ISO country code, default: US
 */

/**
 * Information necessary to collect payments from customers using Stripe
 * @see {@link https://stripe.com/docs/saving-cards|Stripe: Saving Cards}
 *
 * @typedef  {Object}  PaymentMethod
 * @property {string}  source   - Unique token used by Stripe to authorize charges
 * @property {string}  email    - Email address associated with Stripe account
 * @property {string}  number   - Last 4 digits of card number, for display on the profile
 * @property {string}  type     - Card type, for displaying an icon
 * @property {Address} address  - OIDC-compliant billing address
 * @property {boolean} isActive - Is this the payment method we're currently using?
 */

/**
 * The Default User State
 *
 * This object defines all possible properties that can
 * belong to a standard user that will primarily be
 * stored on Auth0's servers.
 *
 * @namespace
 * @private
 * @property {boolean}  isAuthenticating - Is the user currently in the login process?
 * @property {boolean}  isUpdating       - Are we currently updating the user metadata?
 * @property {string}   accessToken      - The Auth0 accessToken needed to make API calls
 * @property {string}   idToken          - A {@link https://jwt.io/|JWT} containing the user profile
 * @property {number}   expiresAt        - A unix timestamp indicating when the {@link initialState.accessToken} expires
 * @property {object}   error            - An object describing why actions for this module may have failed
 * @property {string}   user_id          - The unique Auth0 user id used for retrieving/updating user metadata
 * @property {string[]} roles            - An array of strings indicating roles held by this user in this app
 * @property {object}   abilities        - An object controlling what actions this user is capable of performing in this app
 */
const initialState = {
  isAuthenticating: false,
  isUpdating: false,
  accessToken: null,
  idToken: null,
  expiresAt: null,
  error: null,
  user_id: null,
  roles: [],
  abilities: null,
  /**
   * Auth0 User object, not generally updateable. Saved "as is" when received from Auth0.
   * @see {@link https://auth0.com/docs/users/references/user-profile-structure|Auth0 User Profile Structure}
   *
   * @inner
   * @property {boolean}    blocked        - Has the user been blocked?
   * @property {string}     created_at     - ISO 8601 datetime when user was created
   * @property {string}     email          - Unique email associated with Auth0 identity
   * @property {boolean}    email_verified - Has the email been verified by the user?
   * @property {string}     family_name    - Last name: can only be set via the {@link https://auth0.com/docs/api/management/v2|Auth0 Management API}
   * @property {string}     given_name     - First name: can only be set via the {@link https://auth0.com/docs/api/management/v2|Auth0 Management API}
   * @property {Identity[]} identities     - List of identities (Auth0, Google) registered for this user
   * @property {string}     last_ip        - Last IP address from which the user logged in
   * @property {string}     last_login     - ISO 8601 datetime at which the user last logged in
   * @property {number}     logins_count   - Total number of times a user has logged in
   * @property {string}     name           - Email associated with Auth0 identity or actual "first last" if they signed up with Google @see {@link initialState.user.email}
   * @property {string}     nickname       - Extracted from {@link initialState.user.email} overridden by {@link initialState.user_metadata.nickname}
   * @property {string}     phone_number   - Phone number: only used for SMS connections
   * @property {boolean}    phone_verified - Has the phone number been verified?
   * @property {string}     picture        - URL to gravatar or placeholder with user's initials overridden by {@link initialState.user_metadata.picture}
   * @property {string}     updated_at     - ISO 8601 datetime when user was updated
   * @property {string}     user_id        - Unique ID used to identify the user within Auth0
   * @property {string}     username       - Unique username
   */
  user: {
    blocked: null,
    created_at: null,
    email: null,
    email_verified: null,
    family_name: null,
    given_name: null,
    identities: [],
    last_ip: null,
    last_login: null,
    logins_count: null,
    name: null,
    nickname: null,
    phone_number: null,
    phone_verified: null,
    picture: null,
    updated_at: null,
    user_id: null,
    username: null,
    app_metadata: {},
    /**
     * User Profile. First 10 fields comprise OIDC-compliance.
     *
     * @see {@link https://openid.net/specs/openid-connect-basic-1_0.html|OpenID Connect Implementer's Guide}
     *
     * @inner
     * @property {string}          [title]         - Mr., Ms., Mx., Dr. etc.
     * @property {string}          given_name      - First name
     * @property {string}          [nickname]      - What the user prefers to be called
     * @property {string}          [middle_name]   - Middle name or initial
     * @property {string}          family_name     - Last name
     * @property {string}          [picture]       - URL or file path to profile picture/avatar
     * @property {string}          [usage]         - How the user plans to use QZUKU
     * @property {string}          [discovery]     - How they learned about QZUKU
     * @property {string}          [referredBy]    - From whom they learned about QZUKU (for referral program)
     * @property {boolean}         profileComplete - Has the user completed the user profile?
     * @property {PaymentMethod[]} paymentMethods  - Information necessary to collect payments from customers using Stripe
     */
    user_metadata: {
      title: null,
      given_name: null,
      nickname: null,
      middle_name: null,
      family_name: null,
      picture: null,
      usage: null,
      discovery: null,
      referredBy: null,
      profileComplete: false,
      paymentMethods: []
    }
  }
}

// initialize module state
const state = Object.assign({}, initialState)

const mutations = {
  [LOGIN_REQUEST] (state) {
    state.isAuthenticating = true
  },
  [LOGIN_SUCCESS] (state, { accessToken, idToken, idTokenPayload }) {
    state.accessToken = accessToken
    state.idToken = idToken
    state.expiresAt = idTokenPayload.exp * 1000
    state.user_id = idTokenPayload.sub
    state.roles = idTokenPayload[ns + 'roles'] || []
    state.abilities = defineAbilitiesFor(state.roles)
    state.isAuthenticating = false
  },
  [LOGIN_FAILURE] (state, err) {
    Object.assign(state, initialState, { error: err })
  },
  [REFRESH_REQUEST] (state) {
    state.isAuthenticating = true
  },
  [REFRESH_SUCCESS] (state, { accessToken, idTokenPayload }) {
    state.accessToken = accessToken
    state.expiresAt = idTokenPayload.exp * 1000
    state.isAuthenticating = false
  },
  [REFRESH_FAILURE] (state, err) {
    Object.assign(state, initialState, { error: err })
  },
  [LOGOUT] (state) {
    Object.assign(state, initialState)
  },
  [PROFILE_REQUEST] (state) {
    state.isUpdating = true
  },
  // TODO: Determine if we've chosen the correct merge strategy.
  // If there are already values in the state that differ from
  // what was retrieved from Auth0, perhaps we should ask the user
  // which one should take precedence? Need to think about this.
  [PROFILE_SUCCESS] (state, user) {
    // merge everything together; overwrite arrays
    state.user = merge.all([
      initialState.user,
      state.user,
      user
    ], overwrite)

    // OK! We're done
    state.isUpdating = false
  },
  [PROFILE_FAILURE] (state, err) {
    state.isUpdating = false
    state.error = err
    // should we update state.user here?
  },
  [PROFILE_UPDATE_REQUEST] (state) {
    state.isUpdating = true
  },
  [PROFILE_UPDATE_SUCCESS] (state, user) {
    // merge everything together; overwrite arrays
    state.user = merge.all([
      initialState.user,
      state.user,
      user
    ], overwrite)

    // OK! We're done
    state.isUpdating = false
  },
  [PROFILE_UPDATE_FAILURE] (state, err) {
    state.isUpdating = false
    state.error = err
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
    auth.login()
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
      res => {
        // login completed sucessfully
        commit(LOGIN_SUCCESS, res)
        // request user_metadata
        return dispatch('getUserMeta')
      },
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

  /**
   * Log the user out. Returns them to the login screen.
   *
   * @param {Function} options.commit Function to commit mutations
   */
  logout ({ commit }, returnTo = null) {
    commit(LOGOUT)
    auth.logout(returnTo)
  },

  /**
   * Get the user_metadata from Auth0 for the currently logged-in user
   *
   * @param {Function} options.commit Function to commit mutations
   * @param {Object}   options.state  The auth state of the user
   */
  getUserMeta ({ commit, state }) {
    commit(PROFILE_REQUEST)
    return auth
      .getUserMeta(state.accessToken, state.user_id)
      .then(
        res => commit(PROFILE_SUCCESS, res),
        err => commit(PROFILE_FAILURE, err)
      )
  },

  /**
   * Updates the user_metadata in the Auth0 database.
   *
   * @param {Function} options.commit Function to commit mutations
   * @param {Function} options.state  The auth state of the user
   * @param {Object}   userMeta       The user_metadata to be updated
   */
  updateUserMeta ({ commit, state }, userMeta) {
    commit(PROFILE_UPDATE_REQUEST)
    return auth
      .updateUserMeta(state.user_id, userMeta)
      .then(
        usr => commit(PROFILE_UPDATE_SUCCESS, usr),
        err => commit(PROFILE_UPDATE_FAILURE, err)
      )
  }
}

const getters = {
  isAuthenticated: state =>
    state.expiresAt && new Date().getTime() < state.expiresAt,
  isVerified: state => !!state.user.email_verified,
  profileComplete: state => !!(state.user.user_metadata || {}).profileComplete,
  profile: state => ({
    ...state.user.user_metadata,
    billingAddress: state.billingAddress,
    shippingAddress: state.shippingAddress,
    customer: state.customer
  }),
  avatar: state => state.user.user_metadata.picture || state.user.picture,
  name: state => {
    const gn = state.user.user_metadata.nickname || state.user.user_metadata.given_name || state.user.given_name
    const fn = state.user.user_metadata.family_name || state.user.family_name
    return gn && fn ? `${gn} ${fn}` : ''
  }
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
