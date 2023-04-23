import type { UserConfig } from '@commitlint/types'

// Cosmicconfig does not support loading ES modules
// https://github.com/cosmiconfig/cosmiconfig/pull/283
module.exports = {
  extends: ['@commitlint/config-conventional']
} satisfies UserConfig
