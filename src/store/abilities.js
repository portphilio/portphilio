import { Ability, AbilityBuilder } from '@casl/ability'

/**
 * This instance becomes the global this.$ability instance. From
 * here it is imported by the main store, which in turn exports
 * it to be imported by main.js
 * @type {Ability}
 */
export const ability = new Ability()

/**
 * This store plugin will automatically update the global
 * $ability with the capabilities of the currently logged
 * in user.
 * @param  {Vuex.Store}   store The app store
 * @return {Subscription}       A subscription to all store mutations
 */
export const abilityPlugin = store => {
  // ability.update(store.state.auth.abilities)
  return store.subscribe((mutation, state) => {
    switch (mutation.type) {
      case 'auth/LOGIN_SUCCESS':
        ability.update(state.auth.abilities)
        break
      case 'auth/LOGOUT':
        ability.update([])
        break
    }
  })
}

/**
 * This is the master list of abilities for all user roles.
 *
 * @param  {string[]} roles  The array of roles belonging to a logged-in user
 * @param  {string}   userId The user_id associated with the Auth0 user
 * @return {Rule[]}          An array of ability rules that matches the user's role
 */
export const defineAbilitiesFor = (roles, userId) => {
  const { rules, can } = AbilityBuilder.extract()
  // members can
  if (roles.includes('member')) {
    // view other people's profiles if they are public
    can(['read'], 'Provile', { 'user_metadata.public': true })
    // update their own profiles
    can(['update'], 'Profile', { user_id: userId })
  }
  // administrators can
  if (roles.includes('admin')) {
    // basically do anything
    can('manage', 'all')
    can('visit', 'all')
  }
  return rules
}
