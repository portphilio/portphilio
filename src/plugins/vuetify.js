import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import colors from 'vuetify/es5/util/colors'

Vue.use(Vuetify)

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: colors.pink.lighten4,
        secondary: colors.blue.lighten2,
        accent: '#82B1FF',
        error: colors.pink.darken3,
        info: colors.lightBlue.lighten2,
        success: colors.lime.base,
        warning: colors.yellow.darken2
      }
    },
    options: {
      customProperties: true
    }
  },
  icons: {
    iconfont: 'mdiSvg'
  }
})
