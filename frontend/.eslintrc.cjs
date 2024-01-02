/* eslint-disable @typescript-eslint/naming-convention */
module.exports = {
  env: {
    browser: true,
    'vue/setup-compiler-macros': true
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },
  extends: ['plugin:vue/vue3-recommended', 'plugin:prettier/recommended'],
  rules: {
    'vue/component-api-style': ['error', ['script-setup']],
    'vue/component-name-in-template-casing': [
      'error',
      'PascalCase',
      { ignores: ['/^n-/'] }
    ],
    'vue/define-props-declaration': 'error',
    'vue/html-self-closing': ['error', { html: { void: 'always' } }], // compatibility with prettier
    'vue/no-empty-component-block': 'error',
    'vue/no-undef-components': [
      'error',
      {
        ignorePatterns: [
          'Transition',
          'TransitionGroup',
          'KeepAlive',
          'Teleport',
          'Suspense',
          'Story',
          'Variant',
          'RouterView',
          'RouterLink'
        ]
      }
    ],
    'vue/padding-line-between-blocks': 'warn',
    'vue/prefer-true-attribute-shorthand': 'warn',
    'vue/require-emit-validator': 'error',
    'vue/multi-word-component-names': 'off',
    'vue/custom-event-name-casing': ['error', 'camelCase']
  }
}
