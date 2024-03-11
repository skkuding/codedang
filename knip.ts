/* eslint-disable @typescript-eslint/naming-convention */
import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  workspaces: {
    '.': {
      entry: ['scripts/*.ts']
    },
    'apps/backend': {
      entry: [
        'apps/{admin,client}/**/{main.ts,app.module.ts}',
        'prisma/seed.ts'
      ],
      project: ['**/*.ts'],
      ignoreDependencies: [
        '@nestjs/schematics', // used by NestJS CLI
        '@types/mocha',
        'graphql-type-json',
        'prisma-nestjs-graphql',
        'ts-loader' // used by NestJS CLI
      ],
      paths: {
        '@admin/*': ['apps/admin/src/*'],
        '@client/*': ['apps/client/src/*'],
        '@generated': ['apps/admin/src/@generated'],
        '@libs/prisma': ['libs/prisma/src/index.ts'],
        '@libs/cache': ['libs/cache/src/index.ts'],
        '@libs/auth': ['libs/auth/src/index.ts'],
        '@libs/exception': ['libs/exception/src/index.ts'],
        '@libs/pipe': ['libs/pipe/src/index.ts'],
        '@libs/constants': ['libs/constants/src/index.ts']
      },
      mocha: {
        entry: ['{apps,libs}/**/*.spec.ts']
      }
    },
    'apps/frontend': {
      ignoreDependencies: [
        'eslint-config-next', // used by ESLint
        'sharp' // used by next/image
      ]
    }
  },
  ignore: ['**/*.d.ts', 'collection/**'],
  rules: {
    classMembers: 'off',
    unlisted: 'warn',
    binaries: 'warn',
    unresolved: 'warn'
  },
  ignoreExportsUsedInFile: {
    interface: true,
    type: true
  }
}

export default config
