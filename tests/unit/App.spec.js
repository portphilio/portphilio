/**
 * This is an example of a more complicated test. The App component makes
 * use of a number of sub-components, many of them registered globally
 * like the `router`, `i18n`, and Vuetify. The goal in a test like this
 * one is to recreate **as little as possible** of the actual app context.
 * The test will not run if Vue cannot figure out how to represent, e.g., the
 * `router-link` component, or what the i18n function (`$t()`) is. We tell
 * the testing environment to "mock" or "stub" these parts--that means to
 * replace those parts with minimal substitutions that will allow the test
 * to run, but won't provide any actual functionality.
 *
 * The example test confirms that clicking the button to toggle the "mini"
 * status of the navigation drawer does what it is intended to do. In the
 * actual component, this toggles a state variable from `true` to `false`
 * (or vice versa). In the test, all we need to do is confirm that the
 * function that does the toggling is actually called. We will test the
 * store action function elsewhere when we test the store module.
 */
// import the `vmount()` helper function
import { vmount, Vuex } from './test-utils'
// import the component to be tested
import App from '@/App'
// create a `mount()` function for use in the tests
const mount = vmount(App)
// mock i18n
const mocks = { $t: jest.fn() }
// mock components we won't be testing
const stubs = ['can', 'router-link', 'router-view']

describe('The Portphilio App', () => {
  it('has a button that can minimize the navigation drawer', () => {
    // mock the action that is dispatched when the button is clicked
    const toggleNavDrawerMini = jest.fn()
    // mock the store since `mini` is a computed property that gets its value there
    const store = new Vuex.Store({
      modules: {
        common: {
          namespaced: true,
          actions: { toggleNavDrawerMini }
        }
      }
    })
    // mount the App component
    const wrapper = mount({ mocks, store, stubs })
    // get a reference to the button that toggles the state of the nav drawer
    const button = wrapper.find('[name="toggleNavDrawerMini"]')
    // click the button
    button.trigger('click')
    // as a result, the toggle function should have been called
    expect(toggleNavDrawerMini).toHaveBeenCalled()
  })
})
