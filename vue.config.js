const fs = require('fs')
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')

module.exports = {
  css: {
    loaderOptions: {
      sass: {
        implementation: require('sass'),
        fiber: require('fibers')
      }
    }
  },

  configureWebpack: config => {
    if (process.env.NODE_ENV !== 'production') {
      config.devServer = {
        disableHostCheck: true,
        host: 'portphilio.test',
        https: {
          key: fs.readFileSync('./portphilio.test-key.pem', 'utf8'),
          cert: fs.readFileSync('./portphilio.test.pem', 'utf8')
        }
      }
    }
    config.plugins.push(
      new VuetifyLoaderPlugin()
    )
  },

  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false
    }
  }
}
