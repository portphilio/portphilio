module.exports = {
  presets: [
    '@vue/app'
  ],
  env: {
    test: {
      presets: [['@vue/app', { targets: { node: 'current' } }]]
    }
  },
  sourceType: 'unambiguous'
}
