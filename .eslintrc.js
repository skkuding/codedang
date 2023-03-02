/* eslint-disable @typescript-eslint/naming-convention */
module.exports = {
  env: { node: true },
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  rules: {
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'default',
        format: ['camelCase'],
        leadingUnderscore: 'allow',
        trailingUnderscore: 'allow'
      },

      {
        selector: 'variable',
        format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
        leadingUnderscore: 'allow',
        trailingUnderscore: 'allow'
      },

      {
        selector: 'typeLike',
        format: ['PascalCase']
      },

      {
        selector: ['objectLiteralProperty', 'classProperty'],
        format: ['camelCase', 'PascalCase']
      }
    ],
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      { fixStyle: 'inline-type-imports' }
    ]
  }
}
