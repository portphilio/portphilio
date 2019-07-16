import feathers from '@feathersjs/feathers'
import auth from '@feathersjs/authentication-client'
import feathersVuex from 'feathers-vuex'
import socketio from '@feathersjs/socketio-client'
import io from 'socket.io-client'
// import rest from '@feathersjs/rest-client'
// import axios from 'axios'

// instantiate a feathers client
const app = feathers()

// configure socketio
const socket = io(process.env.VUE_APP_API_URL)
app.configure(socketio(socket))

// configure REST
// const restClient = rest(process.env.VUE_APP_API_URL)
// app.configure(restClient.axios(axios))

const VuexStorage = store => ({
  getItem: key => store.getters[key],
  removeItem: () => {}, // noop: handled by store.auth module
  setItem: () => {} // noop: handled by store.auth module
})

// create authentication plugin
const createAuth0Plugin = (app, auth) => () => {
  return store => {
    // configure the feathers client authentication
    app.configure(auth({
      jwtStrategy: 'auth0',
      storage: VuexStorage(store),
      storageKey: 'auth/accessToken'
    }))
    store.subscribe(async mutation => {
      // console.log(mutation.type)
      // if the user has just logged in...
      if (mutation.type === 'auth/LOGIN_SUCCESS') {
        try {
          // try to authenticate them against the API
          const result = await app.authenticate()
          // and update the user profile
          store.commit('user/PROFILE_SUCCESS', result.user)
        } catch (err) {
          console.log('Authentication error: ', err.message)
        }
      }
      // if the user has refreshed a session...
      if (['auth/LOGIN_CONFIRM', 'auth/REFRESH_SUCCESS'].includes(mutation.type)) {
        try {
          // re-authenticate them against the API
          await app.authenticate()
        } catch (err) {
          console.log('Re-authentication error: ', err.message)
        }
      }
      // if the user has just logged out...
      if (mutation.type === 'auth/LOGOUT') {
        try {
          // log them out from the API
          await app.logout()
          // and clear their profile in the app
          store.commit('user/CLEAR_PROFILE')
        } catch (err) {
          console.log('Error logging out: ', err.message)
        }
      }
    })
  }
}
const auth0Plugin = createAuth0Plugin(app, auth)

const api = app

const {
  makeServicePlugin,
  BaseModel,
  models,
  clients,
  FeathersVuex
} = feathersVuex(app, { serverAlias: 'api', idField: '_id' })

export {
  api,
  auth0Plugin,
  FeathersVuex,
  BaseModel,
  clients,
  makeServicePlugin,
  models
}
