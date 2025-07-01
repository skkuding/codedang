import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: '../backend/schema.gql',
  documents: ['./**/*.{ts,tsx}'],
  generates: {
    './__generated__/': {
      preset: 'client',
      plugins: [],
      presetConfig: {
        gqlTagName: 'gql'
      }
    }
  },
  ignoreNoDocuments: true
}

export default config
