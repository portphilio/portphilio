/**
 * At present, TheHomePage component contains almost zero content.
 * It has no `data`, `methods`, `props` or other JavaScript associated
 * with it except the `name`. In general we would **NOT** have to
 * write tests for a component like this one because for all intents
 * and purposes it is static content that can be tested by visual
 * inspection--i.e. run the app and just look at the page to make sure
 * it contains what we want it to.
 *
 * This test is included as an example of perhaps the simplest possible
 * test that can be written in our environment. In practice, it would
 * be overkill to write tests like this to confirm the text on all of
 * the pages.
 */
import { vshallowMount } from '../../test-utils'
import TheHomePage from '@/components/pages/TheHomePage'

const mount = vshallowMount(TheHomePage)

describe('TheHomePage', () => {
  it('has the title "Home"', () => {
    // mount the component
    const wrapper = mount()
    // search for the title element
    const title = wrapper.find('h2.display-2')
    // check the text inside
    expect(title.text()).toBe('Home')
  })
})
