import { createLocalVue, mount, RouterLinkStub, shallowMount } from '@vue/test-utils'
import Vue from 'vue'
import Vuex from 'vuex'
import Vuetify from 'vuetify'

Vue.use(Vuex)
Vue.use(Vuetify)
const vuetify = new Vuetify()
const localVue = createLocalVue()
const localVueWithVuex = createLocalVue()
localVueWithVuex.use(Vuex)

/**
 * Helper functions to reduce the amount of boilerplate we need to
 * write to test custom SFCs (single-file components) that are built
 * with other Vuetify components. The function takes in the SFC and
 * returns a `mount(options)` function that can be used inside of
 * tests. Here's an example of how it might be used:
 *
 * ```js
 * import { vmount } from './test-utils'
 * import TheComponentToBeTested from '@/components/TheComponentToBeTested'
 * const mount = vmount(TheComponentToBeTested)
 * describe('TheComponentToBeTested', () => {
 *   it('can be mounted with our helper', () => {
 *     const wrapper = mount({ propsData: { foo: 'bar' } })
 *     expect(wrapper.props().foo).toBe('bar')
 *   })
 * })
 * ```
 *
 * @param   {Component} component A custom component that uses Vuetify
 * @returns {Function}            The `mount(options)` function to be used in tests.
 */
const vmount = component => options => mount(component, { localVue, vuetify, ...options })
const vmountVuex = component => options => mount(component, { localVueWithVuex, vuetify, ...options })
const vshallowMount = component => options => shallowMount(component, { localVue, vuetify, ...options })
const vshallowMountVuex = component => options => shallowMount(component, { localVueWithVuex, vuetify, ...options })

export {
  RouterLinkStub,
  vmount,
  vmountVuex,
  vshallowMount,
  vshallowMountVuex,
  Vuex
}
