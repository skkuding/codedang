import { fixupConfigRules } from '@eslint/compat'
import { FlatCompat } from '@eslint/eslintrc'
import eslintJS from '@eslint/js'
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended'
import globals from 'globals'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import eslintTS from 'typescript-eslint'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const flatCompat = new FlatCompat({
  baseDirectory: __dirname
})

const patchedNextLintConfig = fixupConfigRules(
  flatCompat.extends('next/core-web-vitals')
)

export default eslintTS.config(
  {
    ignores: [
      '**/dist',
      '**/node_modules',
      '**/.pnpm-store',
      '**/__generated__',
      '**/@generated',
      '**/collection',
      '**/.next',
      '**/codegen.ts',
      '**/*.config.{js,mjs,ts}'
    ]
  },

  /* Common configuration */
  eslintPluginPrettier,
  eslintJS.configs.recommended,
  ...eslintTS.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        emitDecoratorMetadata: true,
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.node
      }
    },
    rules: {
      'object-shorthand': ['warn', 'always'],
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-inferrable-types': 'warn',
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/no-import-type-side-effects': 'error'
    }
  },
  {
    files: ['**/*.ts'],
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
          selector: 'typeLike',
          format: ['PascalCase']
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow'
        },
        {
          selector: ['objectLiteralProperty', 'classProperty'],
          format: ['camelCase', 'PascalCase']
        }
      ]
    }
  },

  /* Backend configuration */
  {
    files: ['apps/backend/**/*'],
    rules: {
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
      ]
    }
  },
  {
    files: ['apps/backend/**/*.spec.ts'],
    languageOptions: {
      globals: {
        ...globals.mocha
      }
    },
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off'
    }
  },

  /* Frontend configuration */
  ...patchedNextLintConfig.map((config) => ({
    ...config,
    files: ['apps/frontend/**/*']
  })),
  {
    files: ['apps/frontend/**/*'],
    languageOptions: {
      globals: {
        ...globals.browser
      }
    },
    rules: {
      '@next/next/no-html-link-for-pages': [
        'error',
        path.join(__dirname, 'apps/frontend/app')
      ],
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
      ],
      '@typescript-eslint/no-empty-object-type': [
        'error',
        { allowInterfaces: 'with-single-extends' }
      ],
      '@typescript-eslint/no-unused-expressions': [
        'error',
        { allowShortCircuit: true, allowTernary: true }
      ]
    }
  },
  {
    files: ['apps/frontend/**/*.tsx'],
    ignores: ['apps/frontend/components/shadcn/*.tsx'],
    rules: {
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'function-declaration'
        }
      ]
    }
  }
)
