module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/recommended',
    '@vue/standard',
    'vuetify'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'vue/attribute-hyphenation': [
      'warn',
      'always',
      {
        ignore: ['I']
      }
    ],
    'vue/max-attributes-per-line': [
      'error',
      {
        singleline: 2
      }
    ]
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
