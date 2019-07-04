/**
 * A store module that maintains a local copy of ALL of
 * a user's artifacts. When artifacts get added or updated,
 * they go into a queue to be synced with the backend API.
 *
 * @module store/artifacts
 */

// import sort from 'fast-sort'
import { api } from '@/store'
import {
  REMOVE_ARTIFACT,
  SAVE_ARTIFACT,
  CREATE_ARTIFACT_REQUEST,
  CREATE_ARTIFACT_SUCCESS,
  CREATE_ARTIFACT_FAILURE,
  DELETE_ARTIFACT_REQUEST,
  DELETE_ARTIFACT_SUCCESS,
  DELETE_ARTIFACT_FAILURE,
  LOAD_ARTIFACTS_REQUEST,
  LOAD_ARTIFACTS_SUCCESS,
  LOAD_ARTIFACTS_FAILURE,
  UPDATE_ARTIFACT_REQUEST,
  UPDATE_ARTIFACT_SUCCESS,
  UPDATE_ARTIFACT_FAILURE,
  SYNC_ARTIFACTS_REQUEST,
  SYNC_ARTIFACTS_SUCCESS,
  SYNC_ARTIFACTS_FAILURE,
  SET_SEARCH_TERMS,
  SET_STATUSES
} from '@/store/mutation-types'

/**
 * A to-do list item for an artifact
 *
 * @typedef  {Object}   Note
 * @property {ObjectID} _id  - The Mongo ID associated with this note
 * @property {boolean}  done - Is the to-do list item complete?
 * @property {string}   note - The text of the to-do list item
 */

/**
 * A Portphilio Artifact
 *
 * @typedef  {Object}   Artifact
 * @property {ObjectID} _id       - The Mongo ID associated with this note
 * @property {string}   uuid      - A "local" ID for the artifact
 * @property {string}   name      - The name of the artifact
 * @property {string}   narrative - A description of what the artifact is and why it's significant
 * @property {Note[]}   notes     - A to-do list to help the user organize the artifact-creation process
 * @property {string}   status    - Indicates how user feels about the artifact: draft, complete, etc.
 * @property {string[]} tags      - Array of descriptive identifiers that categorize the artifact
 * @property {string}   uri       - The URL specifying where the artifact can be viewed or downloaded
 * @property {string}   userId    - The _id of the owner of the artifact (Mongo in API)
 */

/**
 * The initial state and shape of the artifacts store.
 *
 * @property {Artifact[]} artifacts - The list of artifacts that belong to the currently-logged-in user
 * @property {Error}      error     - The last error that occurred when interacting with the store
 * @property {boolean}    isBusy    - Is the store currently in the middle of an update?
 */
const initialState = {
  artifacts: [],
  statuses: [],
  searchTerms: '',
  error: null,
  isBusy: false
}

const state = Object.assign({}, initialState)

const mutations = {
  [LOAD_ARTIFACTS_REQUEST] (state) {
    state.isBusy = true
  },
  [LOAD_ARTIFACTS_SUCCESS] (state, artifacts) {
    state.artifacts = artifacts
    state.error = null
    state.isBusy = false
  },
  [LOAD_ARTIFACTS_FAILURE] (state, err) {
    state.error = err
    state.isBusy = false
  },
  [REMOVE_ARTIFACT] (state) {
    state.isBusy = true
  },
  [SAVE_ARTIFACT] (state, artifact) {
    state.artifacts.push(artifact)
  },
  [CREATE_ARTIFACT_REQUEST] (state) {
    state.isBusy = true
  },
  [CREATE_ARTIFACT_SUCCESS] (state, artifacts) {
    state.artifacts = artifacts
    state.error = null
    state.isBusy = false
  },
  [CREATE_ARTIFACT_FAILURE] (state, err) {
    state.error = err
    state.isBusy = false
  },
  [UPDATE_ARTIFACT_REQUEST] (state) {
    state.isBusy = true
  },
  [UPDATE_ARTIFACT_SUCCESS] (state, artifacts) {
    state.artifacts = artifacts
    state.error = null
    state.isBusy = false
  },
  [UPDATE_ARTIFACT_FAILURE] (state, err) {
    state.error = err
    state.isBusy = false
  },
  [DELETE_ARTIFACT_REQUEST] (state) {
    state.isBusy = true
  },
  [DELETE_ARTIFACT_SUCCESS] (state, artifacts) {
    state.artifacts = artifacts
    state.error = null
    state.isBusy = false
  },
  [DELETE_ARTIFACT_FAILURE] (state, err) {
    state.error = err
    state.isBusy = false
  },
  [SYNC_ARTIFACTS_REQUEST] (state) {
    state.isBusy = true
  },
  [SYNC_ARTIFACTS_SUCCESS] (state, artifacts) {
    state.artifacts = artifacts
    state.error = null
    state.isBusy = false
  },
  [SYNC_ARTIFACTS_FAILURE] (state, err) {
    state.error = err
    state.isBusy = false
  },
  [SET_SEARCH_TERMS] (state, terms) {
    state.searchTerms = terms
  },
  [SET_STATUSES] (state, statuses) {
    state.statuses = statuses
  }
}

const actions = {
  /**
   * Attempts to create a new artifact in the remote API database.
   *
   * @param   {function} options.commit Triggers commit of state mutations
   * @param   {Artifact} artifact       The artifact to be created
   * @returns {Promise}                 Resolves to the created artifact or an error
   */
  create ({ commit }, artifact) {
    commit(CREATE_ARTIFACT_REQUEST)
    return api.service('artifacts')
      .create(artifact)
      .then(
        art => commit(CREATE_ARTIFACT_SUCCESS, art),
        err => commit(CREATE_ARTIFACT_FAILURE, err)
      )
  },
  /**
   * Attempts to completely replace the artifact in the database
   * with the given _id with the artifact passed to the API.
   *
   * @param   {function} options.commit Triggers commit of state mutations
   * @param   {Artifact} artifact       The artifact to be updated
   * @returns {Promise}                 Resolves to the updated artifact or an error
   */
  update ({ commit }, artifact) {
    commit(UPDATE_ARTIFACT_REQUEST)
    return api.service('artifacts')
      .update(artifact._id, artifact)
      .then(
        art => commit(UPDATE_ARTIFACT_SUCCESS, art),
        err => commit(UPDATE_ARTIFACT_FAILURE, err)
      )
  },
  loadArtifacts ({ commit }, ownerId) {
    commit(LOAD_ARTIFACTS_REQUEST)
    return api.service('artifacts')
      .find({ query: { userId: ownerId, $limit: -1 } })
      .then(
        art => commit(LOAD_ARTIFACTS_SUCCESS, art),
        err => commit(LOAD_ARTIFACTS_FAILURE, err)
      )
  },
  remove ({ commit, state, dispatch }, artifactId) {
    commit(DELETE_ARTIFACT_REQUEST)
    try {
      // clone the state.artifacts array
      const artifacts = JSON.parse(JSON.stringify(state.artifacts))
      // try to remove the specified artifact
      artifacts.splice(artifacts.findIndex(a => a._id === artifactId || a.uuid === artifactId), 1)
      // commit the change
      commit(DELETE_ARTIFACT_SUCCESS, artifacts)
    } catch (err) {
      commit(DELETE_ARTIFACT_FAILURE, err)
    }
  },
  save ({ commit, state, dispatch }, artifact) {
    // make sure it is in our state.artifacts array
    commit(SAVE_ARTIFACT, artifact)
    // check for _id to see if this is a new or updated item
    // if (!artifact._id) {
    //   // it's a new artifact
    //   delete artifact._id
    //   dispatch('common/addItemToQueue', {
    //     action: 'artifacts/create',
    //     params: {
    //       data: artifact
    //     }
    //   }, { root: true })
    // } else {
    //   // it is being updated
    //   dispatch('common/addItemToQueue', {
    //     action: 'artifacts/update',
    //     params: {
    //       id: artifact._id,
    //       data: artifact
    //     }
    //   }, { root: true })
    // }
  },
  setSearchTerms ({ commit }, terms) {
    commit(SET_SEARCH_TERMS, terms)
  },
  setStatuses ({ commit }, statuses) {
    commit(SET_STATUSES, statuses)
  }
}

const filterByStatus = (artifacts, statuses) => {
  return statuses.length > 0 && artifacts.length > 0
    ? artifacts.filter(a => statuses.includes(a.status))
    : artifacts
}

/**
 * Standalone function that takes a string of space and/or comma
 * separated search terms and an array of artifact objects and
 * returns a list of artifacts filtered by the search terms. Any
 * search term that is found in any searchable field results in
 * that artifact being returned.
 *
 * @param   {Artifact[]} artifacts An array of Artifact objects
 * @param   {string}     terms     A space and/or comma delimited string of search terms
 * @returns {Artifact[]}           The input array of Artifacts filtered by the terms
 */
const search = (artifacts, terms) => {
  // if there are no terms, just return the original list
  if (terms === '' || artifacts.length === 0) return artifacts
  // convert terms into a case-insensitive regex that looks for ANY word
  const re = new RegExp(terms.replace(',', ' ').replace(/\s+/g, '|'), 'gi')
  return artifacts.filter(
    // test the regex against each of the searchable fields in the artifact
    a => re.test(a.name) ||
      re.test(a.uri) ||
      re.test(a.narrative) ||
      re.test(a.tags.reduce((tags, tag) => tags + tag, '')) ||
      re.test(a.notes.reduce((notes, note) => notes + note, ''))
  )
}

const getters = {
  artifact: state => id => {
    // start by trying to find by the mongo-assigned _id property
    const artifact = state.artifacts.find(a => a._id === id)
    if (artifact) {
      // we found one, so return it
      return artifact
    }
    // must be a local-only artifact, search by uuid
    return state.artifacts.find(a => a.uuid === id)
  },
  /**
   * The current searched, filtered, and sorted list of artifacts
   */
  artifacts: state => {
    // clone the list of all artifacts
    let artifacts = JSON.parse(JSON.stringify(state.artifacts))
    // filter by selected statuses
    artifacts = filterByStatus(artifacts, state.statuses)
    // filter by search terms
    artifacts = search(artifacts, state.searchTerms)
    // sort what's remaining
    // sort(artifacts).by(state.sorter)
    // return the result
    return artifacts
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
