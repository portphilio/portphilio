import { api, makeServicePlugin, BaseModel } from '@/services/api'

export class User extends BaseModel {
  static modelName = 'User'
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
static instanceDefaults = () => ({
    app_metadata: {
      roles: []
    },
    blocked: false,
    blocked_for: [],
    createdAt: '',
    created_at: '',
    email: '',
    email_verified: false,
    family_name: '',
    gender: null,
    given_name: '',
    guardian_authenticators: [],
    identities: [],
    last_ip: null,
    last_login: null,
    last_password_reset: null,
    locale: 'en',
    logins_count: 0,
    multifactor: null,
    name: '',
    nickname: '',
    phone_number: null,
    phone_verified: null,
    picture: '',
    updatedAt: '',
    updated_at: '',
    user_id: '',
    user_metadata: {},
    username: ''
  })
}

const servicePath = 'users'
const servicePlugin = makeServicePlugin({
  Model: User,
  service: api.service(servicePath),
  servicePath
})

export default servicePlugin
