/**
 * A store module to manage logged-in user state
 *
 * @module store/user
 */
// utility for merging state objects
import merge from 'deepmerge'

import {
  PROFILE_REQUEST,
  PROFILE_SUCCESS,
  PROFILE_FAILURE,
  PROFILE_UPDATE_REQUEST,
  PROFILE_UPDATE_SUCCESS,
  PROFILE_UPDATE_FAILURE,
  CLEAR_PROFILE
} from '@/store/mutation-types'

import { api } from '@/store'

// options that instruct merge to overwrite arrays
const overwrite = { arrayMerge: (a, b) => b }

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
 * User model, adapted from the Auth0 user model.
 * @see {@link https://auth0.com/docs/users/references/user-profile-structure|Auth0 User Profile Structure}
 *
 * @property {string}     _id            - The Mongoose ID associated with this user
 * @property {boolean}    blocked        - Has the user been blocked?
 * @property {string}     created_at     - ISO 8601 datetime when user was created in Auth0
 * @property {string}     createdAt      - ISO 8601 datetime when user was created in the API
 * @property {string}     email          - Unique email associated with Auth0 identity
 * @property {boolean}    email_verified - Has the email been verified by the user?
 * @property {string}     family_name    - Last name: can only be set via the {@link https://auth0.com/docs/api/management/v2|Auth0 Management API}
 * @property {string}     given_name     - First name: can only be set via the {@link https://auth0.com/docs/api/management/v2|Auth0 Management API}
 * @property {Identity[]} identities     - List of identities (Auth0, Google) registered for this user
 * @property {boolean}    isUpdating     - Are we in the middle of updating/retrieving data from the API?
 * @property {string}     last_ip        - Last IP address from which the user logged in
 * @property {string}     last_login     - ISO 8601 datetime at which the user last logged in
 * @property {number}     logins_count   - Total number of times a user has logged in
 * @property {string}     name           - Email associated with Auth0 identity or actual "first last" if they signed up with Google @see {@link initialState.user.email}
 * @property {string}     nickname       - Extracted from {@link initialState.user.email} overridden by {@link initialState.user_metadata.nickname}
 * @property {string}     phone_number   - Phone number: only used for SMS connections
 * @property {boolean}    phone_verified - Has the phone number been verified?
 * @property {string}     picture        - URL to gravatar or placeholder with user's initials overridden by {@link initialState.user_metadata.picture}
 * @property {string}     updated_at     - ISO 8601 datetime when user was updated in Auth0
 * @property {string}     updatedAt      - ISO 8601 datetime when user was updated in the API
 * @property {string}     user_id        - Unique ID used to identify the user within Auth0
 * @property {string}     username       - Unique username
 */
const initialState = {
  _id: null,
  app_metadata: {},
  blocked: null,
  blocked_for: null,
  created_at: null,
  createdAt: null,
  email: null,
  email_verified: null,
  family_name: null,
  gender: null,
  given_name: null,
  identities: [],
  isUpdating: false,
  guardian_authenticators: [],
  last_ip: null,
  last_login: null,
  last_password_reset: null,
  locale: 'en',
  logins_count: null,
  multifactor: null,
  name: null,
  nickname: null,
  password_set_date: null,
  phone_number: null,
  phone_verified: null,
  picture: null,
  updated_at: null,
  updatedAt: null,
  user_id: null,
  /**
   * Additional user information. Not part of the "official" schema.
   * Updating this schema does NOT require updating the API, but there
   * is no guaranteed that any of these properties will exist on a given user.
   *
   * @inner
   * @property {string}          discovery       - How they learned about Portphilio
   * @property {string}          middle_name     - Middle name or initial
   * @property {PaymentMethod[]} paymentMethods  - Information necessary to collect payments from customers using Stripe
   * @property {boolean}         profileComplete - Has the user completed their profile?
   * @property {string}          referredBy      - From whom they learned about Portphilio (for referral program)
   * @property {string}          title           - Mr., Ms., Dr., etc.
   * @property {string}          usage           - How the user plans to use Portphilio
   */
  user_metadata: {
    discovery: null,
    middle_name: null,
    paymentMethods: [],
    profileComplete: false,
    referredBy: null,
    title: null,
    usage: null
  },
  username: null
}

// defaults to initialState
const state = { ...initialState }

const mutations = {
  [PROFILE_REQUEST] (state) {
    state.isUpdating = true
  },
  // TODO: Determine if we've chosen the correct merge strategy.
  // If there are already values in the state that differ from
  // what was retrieved from Auth0, perhaps we should ask the user
  // which one should take precedence? Need to think about this.
  [PROFILE_SUCCESS] (state, user) {
    // merge everything together; overwrite arrays
    const newState = merge.all([
      initialState,
      state,
      user
    ], overwrite)
    Object.assign(state, newState, { error: null, isUpdating: false })
  },
  [PROFILE_FAILURE] (state, err) {
    state.isUpdating = false
    state.error = err.toString()
    // should we update state here?
  },
  [PROFILE_UPDATE_REQUEST] (state) {
    state.isUpdating = true
  },
  [PROFILE_UPDATE_SUCCESS] (state, user) {
    // merge everything together; overwrite arrays
    const newState = merge.all([
      initialState,
      state,
      user
    ], overwrite)
    Object.assign(state, newState, { error: null, isUpdating: false })
  },
  [PROFILE_UPDATE_FAILURE] (state, err) {
    state.isUpdating = false
    state.error = err.toString()
  },
  [CLEAR_PROFILE] (state) {
    Object.assign(state, initialState)
  }
}

const actions = {
  /**
   * Get the currently logged-in user's profile from the API
   * using their Auth0 user_id
   *
   * @param   {Function} options.commit Function to commit mutations
   * @param   {String}   userId         The _id associated with this user in Auth0
   * @returns {Promise}                 A Promise that resolves to the user's profile or an error
   */
  getProfile ({ commit }, userId) {
    commit(PROFILE_REQUEST)
    return api.service('users')
      .find({ query: { user_id: userId } })
      .then(
        res => commit(PROFILE_SUCCESS, res.data[0]),
        err => commit(PROFILE_FAILURE, err)
      )
  },

  /**
   * Patches the user_metadata in the API database. Merges the
   * passed data with whatever is already stored in the database.
   *
   * @param   {Function} options.commit Function to commit mutations
   * @param   {String}   userId         The _id associated with this user in Auth0
   * @param   {Object}   profile        An object representing the data to be updated
   * @returns {Promise}                 A Promise that resolves to the user's profile or an error
   */
  patchProfile ({ commit }, userId, profile) {
    commit(PROFILE_UPDATE_REQUEST)
    return api.service('users')
      .patch(null, profile, { query: { user_id: userId } })
      .then(
        usr => commit(PROFILE_UPDATE_SUCCESS, usr),
        err => commit(PROFILE_UPDATE_FAILURE, err)
      )
  },

  clearProfile ({ commit }) {
    commit(CLEAR_PROFILE)
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
