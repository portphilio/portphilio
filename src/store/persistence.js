/**
 * Persist the store's state in local storage
 */

const makeQueue = () => ({
  tasks: [],
  flushing: false,
  flush () {
    this.flushing = true
    const chain = () => {
      const next = this.tasks.shift()
      if (next) {
        return next.then(chain)
      } else {
        this.flushing = false
      }
    }
    return Promise.resolve(chain())
  },
  enqueue (task) {
    this.tasks.push(task)
    return this.flushing ? Promise.resolve() : this.flush()
  }
})

const setupPersistence = ({
  feathersModels = {},
  key = 'vuex',
  storage = null
} = {}) => {
  const queue = makeQueue()
  const plugin = async store => {
    // get the saved state from localforage
    const savedState = await storage.getItem(key).then(
      item => typeof item === 'string' ? JSON.parse(item || '{}') : item
    )
    // rehydrate the store
    store.commit('RESTORE_MUTATION', savedState)
    // subscribe to state changes that should be persisted
    store.subscribe((mutation, state) => {
      // after each mutation, update localforage
      queue.enqueue(storage.setItem(key, state))
    })
  }
  const RESTORE_MUTATION = function RESTORE_MUTATION (state, savedState) {
    // merge the passed in state and savedState
    const mergedState = { ...state, ...savedState }
    // for each key, i.e. module
    for (const modelName of Object.keys(mergedState)) {
      // try to get the model class
      const Model = feathersModels[modelName]
      // if the model class is not undefined...
      if (Model !== undefined) {
        // convert items into model instances
        Object.values(mergedState[modelName].keyedById).forEach(
          item => new Model(item)
        )
      } else {
        // just re-add the item to the store
        this._vm.$set(state, modelName, mergedState[modelName])
      }
    }
  }

  return {
    plugin,
    RESTORE_MUTATION
  }
}

export default setupPersistence
