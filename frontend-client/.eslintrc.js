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
  },
  overrides: [
    {
      files: ['*.tsx'],
      excludedFiles: ['components/ui/*.tsx'],
      rules: {
        'react/function-component-definition': [
          'error',
          {
            namedComponents: 'function-declaration'
          }
        ],
        'func-style': ['off']
      }
    }
  ]
}
