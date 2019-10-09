const fs = require('fs')

module.exports = {
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
    msTileColor: '#f06292',
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: 'src/service-worker.js'
    }
  },
  transpileDependencies: [
    '@feathersjs',
    'debug',
    'feathers-vuex'
  ]
}
