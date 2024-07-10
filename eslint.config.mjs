import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import nextPlugin from '@next/eslint-plugin-next'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import reactPlugin from 'eslint-plugin-react'
import hooksPlugin from 'eslint-plugin-react-hooks'
import globals from 'globals'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const compat = new FlatCompat({
  baseDirectory: dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
})

export default [
  ...compat.extends(
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ),
  {
    plugins: {
      '@typescript-eslint': typescriptEslint
    },
    languageOptions: {
      globals: {
        ...globals.node
      },
      parser: tsParser,
      sourceType: 'commonjs',
      parserOptions: {
        emitDecoratorMetadata: true,
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-inferrable-types': 'warn',
      'func-style': ['error', 'expression'],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['apps/*', 'libs/*'],
              message:
                'Please import with path alias like `@apps/*` or `@libs/*`'
            }
          ]
        }
      ],
      'object-shorthand': ['warn', 'always']
    }
  },
  {
    files: ['**/*.{ts}'],
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
          selector: 'import',
          format: ['camelCase', 'PascalCase']
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
      ]
    }
  },
  {
    files: ['**/frontend/**'],
    plugins: {
      react: reactPlugin,
      'react-hooks': hooksPlugin,
      '@next/next': nextPlugin
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      ...reactPlugin.configs['jsx-runtime'].rules,
      ...hooksPlugin.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      '@next/next/no-html-link-for-pages': [
        'error',
        '/workspace/apps/frontend/app'
      ]
    }
  },
  {
    files: ['**/frontend/**/*.tsx}'],
    ignores: ['**/components/ui/*.tsx'],
    rules: {
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'function-declaration'
        }
      ],
      'func-style': ['off'],
      'no-restricted-imports': [
        'error',
        {
          name: '@apollo/client',
          importNames: ['gql'],
          message: 'Please use @generated instead.'
        },
        {
          name: '@/__generated__',
          message: 'Please use @generated instead.'
        },
        {
          name: '@/__generated__/graphql',
          message: 'Please use @generated/graphql instead.'
        }
      ]
    }
  },
  {
    ignores: [
      '**/.next',
      '**/dist',
      '**/node_modules',
      '.pnpm-store',
      '**/@generated',
      '**/collection',
      'eslint.config.mjs',
      '**/*.config.js'
    ]
  }
]
