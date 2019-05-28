// import Auth0.js
import auth0 from 'auth0-js'

/**
 * A factory function to generate an object that encapsulates
 * all of the functions necessary to use Auth0 in most
 * authentication scenarios. For more detailed docs, see:
 * https://auth0.com/docs/libraries/auth0js/v9
 *
 * @param  {Object} config Configuration options for auth0.WebAuth
 * @return {Object}        auth object encapsulating configured functions
 */
export const createAuth = ({
  domain = '',
  clientID = '',
  audience = `https://${domain}/userinfo`,
  redirectUri = 'http://localhost:8080/handle-auth',
  responseType = 'id_token token',
  scope = 'openid profile email',
  accessType = 'offline' // forces google-oauth2 connections to provide refresh tokens
} = {}) => {
  /**
   * Configuration options for instantiating
   * the auth0.WebAuth instance.
   *
   * @var {Object}
   */
  const config = {
    domain,
    clientID,
    redirectUri,
    audience,
    responseType,
    scope,
    accessType
  }

  /**
   * A private WebAuth object for this factory.
   *
   * @var {Object}
   */
  const auth = new auth0.WebAuth(config)

  return Object.assign({
    /**
     * The configuration options used to instantiate
     * the auth0.WebAuth object used by this object.
     *
     * @var {Object}
     */
    config,

    /**
     * The auth0.WebAuth object initialized above.
     *
     * @var {Object}
     */
    auth,

    /**
     * Becomes an auth0.Management object when authentication
     * is successful.
     *
     * @var {Object}
     */
    manager: {},

    /**
     * Initiate the login process
     */
    login () {
      this.auth.authorize(this.config)
    },

    /**
     * Handle the result of the login
     * @returns {Promise} Resolves to { accessToken, idToken, expiresIn }
     */
    handle () {
      return new Promise(
        function (resolve, reject) {
          this.auth.parseHash(function (err, authResult) {
            err && reject(err)
            resolve(authResult)
          })
        }.bind(this)
      )
    },

    /**
     * Gets the basic user profile. Does NOT incude any metadata.
     * This is the _same_ info contained in the idToken returned by
     * the parseHash () function used in handle () above. See:
     * https://auth0.com/docs/api/authentication#get-user-info
     *
     * @param   {string}  token Access token required to access user info
     * @returns {Promise}       Resolves to default Auth0 user profile
     */
    userInfo (token) {
      return new Promise(
        function (resolve, reject) {
          this.auth.client.userInfo(token, function (err, user) {
            err && reject(err)
            resolve(user)
          })
        }.bind(this)
      )
    },

    /**
     * Used to acquire a new access token from Auth0 for a user
     * who has already authenticated. It can also be used to get
     * an access token for using auth0.Management API.
     *
     * @param   {Object}  params Optional. Should include { audience, scope } if used.
     * @returns {Promise}        Resolves to { accessToken, idToken, expiresIn }
     */
    checkSession (params = {}) {
      return new Promise(
        function (resolve, reject) {
          this.auth.checkSession(params, function (err, authResult) {
            err && reject(err)
            resolve(authResult)
          })
        }.bind(this)
      )
    },

    /**
     * Log out of the application
     */
    logout (returnTo = '/') {
      this.access_token = ''
      this.auth.logout({
        returnTo,
        clientID: this.config.clientID
      })
    },

    /**
     * Retrieve the userMetadata for the currently logged-in user.
     *
     * @param   {string}  token   An access token for the Manamement API
     * @param   {string}  userId The Auth0 userId for the current user
     * @returns {Promise}         An object containing the user's metadata
     */
    getUserMeta (token, userId) {
      return new Promise(
        function (resolve, reject) {
          const manager = new auth0.Management({
            domain: this.config.domain,
            token
          })
          manager.getUser(userId, function (err, userMeta) {
            err && reject(err)
            resolve(userMeta)
          })
        }.bind(this)
      )
    },

    /**
     * Update the user_metadata for the currently logged-in user. Be VERY
     * careful about updating metadata. This will overwrite existing values
     * ONLY for top level properties. Lower-level properties must be re-created
     * completely. Also, the token submitted must have been created with at
     * least `update:current_user_metadata` scope.
     *
     * @param   {string}  token    An access token for the Manamement API
     * @param   {string}  userId   The Auth0 userId for the current user
     * @param   {Object}  userMeta The metadata to be updated.
     * @returns {Promise}          An object containing the user's metadata
     */
    updateUserMeta (token, userId, userMeta) {
      return new Promise(
        function (resolve, reject) {
          const manager = new auth0.Management({
            domain: this.config.domain,
            token
          })
          manager.patchUserMetadata(userId, userMeta, function (err, user) {
            err && reject(err)
            resolve(user)
          })
        }.bind(this)
      )
    }
  })
}
