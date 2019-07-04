import feathers from '@feathersjs/client'
import axios from 'axios'

const app = feathers()
const rc = feathers.rest(process.env.VUE_APP_API_URL)
app.configure(rc.axios(axios))

export const api = app

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
