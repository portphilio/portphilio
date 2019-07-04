/**
 * A store module to manage common app-wide state
 */
import {
  ADD_ERROR_TO_QUEUE,
  ADD_ITEM_TO_QUEUE,
  PAUSE_QUEUE,
  REMOVE_ITEM_FROM_QUEUE,
  RESUME_QUEUE,
  SET_ONLINE_STATUS,
  TOGGLE_NAV_DRAWER_MINI
} from '@/store/mutation-types'

/**
 * Actions which require internet connectivity that can't
 * currently be performed because we're offline.
 *
 * @typedef  {Object}  QueueItem
 * @property {string}  action - The action to be dispatched
 * @property {object}  params - The parameters necessary to dispatch the action
 * @property {Error}   error  - If an error occurred when dispatching the item, it will be stored here
 */

const initialState = {
  isOnline: null,
  navDrawerIsMini: false,
  queue: [],
  queueIsPaused: null
}

const state = Object.assign({}, initialState)

const mutations = {
  [ADD_ERROR_TO_QUEUE] (state, err) {
    state.queue[0].error = err
  },
  [ADD_ITEM_TO_QUEUE] (state, item) {
    state.queue.push(item)
  },
  [PAUSE_QUEUE] (state) {
    state.queueIsPaused = true
  },
  [REMOVE_ITEM_FROM_QUEUE] (state) {
    // get a copy of the queue
    const queue = [...state.queue]
    // remove the first item
    queue.unshift()
    // update the state to match
    state.queue = queue
  },
  [RESUME_QUEUE] (state) {
    state.queueIsPaused = false
  },
  [SET_ONLINE_STATUS] (state, status) {
    state.isOnline = status
  },
  [TOGGLE_NAV_DRAWER_MINI] (state) {
    state.navDrawerIsMini = !state.navDrawerIsMini
  }
}

const actions = {
  addItemToQueue ({ commit, state, dispatch }, item) {
    commit(ADD_ITEM_TO_QUEUE, item)
    // resume the queue if possible
    if (state.isOnline) dispatch('resumeQueue', false)
  },
  toggleNavDrawerMini ({ commit, state }) {
    commit(TOGGLE_NAV_DRAWER_MINI)
    return state.navDrawerIsMini
  },
  pauseQueue ({ commit }) {
    commit(SET_ONLINE_STATUS, false)
  },
  async resumeQueue ({ commit, state, dispatch }, updateOnlineStatus = true) {
    // if resuming because of online status change, i.e. we just re-connected
    if (updateOnlineStatus) commit(SET_ONLINE_STATUS, true)
    commit(RESUME_QUEUE)
    // while there are still items in our queue
    while (state.queue.length > 0) {
      // abort if we've lost connectivity or if the queue was paused for some reason
      if (!state.isOnline || state.queueIsPaused) return
      try {
        // dispatch the first item in the queue
        await dispatch(
          state.queue[0].action,
          ...Object.values(state.queue[0].params),
          { root: true }
        )
        // success, remove the item from the queue
        commit(REMOVE_ITEM_FROM_QUEUE)
      } catch (err) {
        // uh-oh. what should we do?
        commit(PAUSE_QUEUE)
        commit(ADD_ERROR_TO_QUEUE, err)
        // might need to have user handle this scenario?
      }
    }
  }
}

const getters = {
  inSync: state => state.queue.length === 0
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
