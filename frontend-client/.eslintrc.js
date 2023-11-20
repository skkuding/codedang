/* eslint-disable @typescript-eslint/no-var-requires */
module.exports = {
  extends: ['next', 'next/core-web-vitals'],
  env: {
    browser: true,
    node: true
  },
  rules: {
    '@next/next/no-html-link-for-pages': [
      'error',
      require('path').join(__dirname, 'app')
    ]
  }
}
