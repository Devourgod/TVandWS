module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  rules: {
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'semi': ['error', 'never'],
    'indent': 0,
    'space-before-function-paren': 0,
    'object-curly-spacing': ['error', 'never']
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
