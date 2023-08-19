/* eslint-disable @typescript-eslint/naming-convention */
import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  workspaces: {
    backend: {
      entry: [
        'apps/{admin,client}/**/{main.ts,app.module.ts}',
        'prisma/seed.ts'
      ],
      project: ['**/*.ts'],
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
      }
    },
    frontend: {
      entry: ['src/main.ts'],
      project: ['**/*.{vue,ts}'],
      ignore: ['**/*.story.vue'],
      ignoreDependencies: ['virtual:*', '~icons/*', '@iconify-json/*'], // TODO: handle icon packages
      paths: {
        '@/*': ['src/*']
      }
    },
    'testcase-server': {
      entry: 'init-testcase.ts'
    }
  },
  ignore: ['**/*.d.ts'],
  ignoreBinaries: ['docker-compose'],
  rules: {
    classMembers: 'off',
    unlisted: 'warn',
    binaries: 'warn',
    unresolved: 'warn'
  },
  ignoreExportsUsedInFile: {
    interface: true,
    type: true
  },
  compilers: {
    vue: (text) => {
      const vueCompiler = /<script\b[^>]*>([\s\S]*?)<\/script>/gm
      const scripts = []
      let match
      while ((match = vueCompiler.exec(text))) scripts.push(match[1])
      return scripts.join(';')
    }
  }
}

export default config
