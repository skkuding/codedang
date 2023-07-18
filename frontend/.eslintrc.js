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
    'vue/multi-word-component-names': 'off'
  }
}
