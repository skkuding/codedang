import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema:
    process.env.NEXT_PUBLIC_GQL_BASEURL ?? 'https://dev.codedang.com/graphql',
  // this assumes that all your source files are in a top-level `src/` directory - you might need to adjust this to your file structure
  documents: ['./**/*.{ts,tsx}'],
  generates: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
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
