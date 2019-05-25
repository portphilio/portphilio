const fs = require('fs')

module.exports = {
  css: {
    loaderOptions: {
      sass: {
        data: '@import "~@/sass/main.scss"',
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
  },

  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false
    }
  },

  pwa: {
    name: 'Portphilio',
    themeColor: '#f06292',
    msTileColor: '#f06292'
  }
}
