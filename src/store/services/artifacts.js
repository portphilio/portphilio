import { api, makeServicePlugin, BaseModel } from '@/services/api'

class Artifact extends BaseModel {
  static modelName = 'Artifact'
  // // eslint-disable-next-line
  // constructor (data, options) {
  //   super(data, options)
  // }
  static instanceDefaults = () => ({
    createdAt: '',
    name: '',
    narrative: '',
    notes: [],
    status: 'draft',
    tags: [],
    updatedAt: '',
    uri: '',
    userId: '' // how to handle this?
  })
  // do we even need to do this? i.e. hydrate the associated user?
  static setupInstance (data, { models, store }) {
    const { User } = models.api
    data.user && (data.user = new User(data.user))
    return data
  }
}

const servicePath = 'artifacts'
const servicePlugin = makeServicePlugin({
  Model: Artifact,
  service: api.service(servicePath),
  servicePath
})

export default servicePlugin
