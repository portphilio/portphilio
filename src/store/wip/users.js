import { api, makeServicePlugin, BaseModel } from '@/services/api'

export class User extends BaseModel {
  static modelName = 'User'
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

const servicePath = 'artifacts'
const servicePlugin = makeServicePlugin({
  Model: User,
  service: api.service(servicePath),
  servicePath
})

export default servicePlugin
