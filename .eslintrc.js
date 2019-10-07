module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/recommended',
    '@vue/standard',
    'vuetify'
  ],
  plugins: [
    'vuetify'
  ],
  rules: {
    'comma-dangle': ['error', 'never'],
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
    ],
    'vuetify/no-deprecated-classes': 'error',
    'vuetify/grid-unknown-attributes': 'error',
    'vuetify/no-legacy-grid': 'error'
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
