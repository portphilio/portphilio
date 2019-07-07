import feathers from '@feathersjs/feathers'
// import rest from '@feathersjs/rest-client'
// import axios from 'axios'
import socketio from '@feathersjs/socketio-client'
// import auth from '@feathersjs/authentication-client'
import io from 'socket.io-client'
import feathersVuex from 'feathers-vuex'
// import { store } from '@/store/'

// instantiate a feathers client
const app = feathers()

// configure REST
// const restClient = rest(process.env.VUE_APP_API_URL)
// app.configure(restClient.axios(axios))

// configure socketio
const socket = io(process.env.VUE_APP_API_URL)
socket.on('connect', () => {
  console.log('connecting to web socket...')
  socket
    .emit('authenticate', { token: 'a.bad.jwt' })
    .on('authenticated', () => {
      console.log('we authenticated!')
    }).on('unauthorized', (error, callback) => {
      if (error.data.type === 'UnauthorizedError' || error.data.code === 'invalid_token') {
        // do something to refresh the token and/or handshake?
        callback()
        console.log('Invalid token')
      }
    })
})
app.configure(socketio(socket))

// configure authentication for socketio
// const VuexStorage = store => ({
//   getItem: key => Promise.resolve(store.getters[key])
// })
// app.configure(auth({
//   prefix: 'Bearer',
//   storage: VuexStorage(store),
//   storageKey: 'auth/accessToken'
// }))

const api = app

const {
  makeServicePlugin,
  BaseModel,
  models,
  clients,
  FeathersVuex
} = feathersVuex(app, { serverAlias: 'api' })

export {
  api,
  makeServicePlugin,
  BaseModel,
  models,
  clients,
  FeathersVuex
}

// export const api = token => {
//   // TODO: Throw an error if token is not set

//   const params = {
//     headers: {
//       'Authorization': `Bearer ${token}`
//     }
//   }

//   return {
//     /**
//      * Search the Auth0 users to find any users whose email,
//      * name, first name, last name match the given search terms.
//      *
//      * @param   {string}  searchTerms The terms to search users by
//      * @returns {Promise}             A promise resolving to a page of query results
//      */
//     searchUsers: async searchTerms => {
//       // add the search terms to the query
//       // how do we want to process this? we could tokenize it,
//       // replace spaces and/or commas with wildcards (*). we
//       // could match against more/less/different fields
//       // DO WE NEED TO SANITIZE THIS??? Is there any way it could be abused?
//       params.query = {
//         email: `*${searchTerms}*`,
//         name: `*${searchTerms}*`,
//         given_name: `*${searchTerms}*`,
//         family_name: `*${searchTerms}*`
//       }
//       return app.service('/auth0/users').find(params)
//     },
//     getMembers: async query => {
//       query = query || {}
//       return app.service('members').find(params)
//     },
//     getUsers: async query => app.service('/auth0/users').find({ ...params, ...query }),
//     getProjects: async query => app.service('/projects').find({ ...params, ...query }),
//     getProject: async id => app.service('/projects').get(id, params),
//     searchProjects: async query => app.service('/projects').find({ ...params, ...query }),
//     upload: async (uri, id) => app.service('/assets').create({ id, uri }, params)
//   }
// }
