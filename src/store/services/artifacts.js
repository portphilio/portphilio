import { api, makeServicePlugin, BaseModel } from '@/services/api'

class Artifact extends BaseModel {
  static modelName = 'Artifact'
  // eslint-disable-next-line
  constructor (data, options) {
    super(data, options)
  }
  static instanceDefaults = () => ({
    createdAt: null,
    name: null,
    narrative: null,
    notes: [],
    status: 'draft',
    tags: [],
    updatedAt: null,
    uri: null,
    userId: null
  })
}

const servicePath = 'artifacts'
const servicePlugin = makeServicePlugin({
  Model: Artifact,
  service: api.service(servicePath),
  servicePath
})

export default servicePlugin
