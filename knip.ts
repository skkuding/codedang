/* eslint-disable @typescript-eslint/naming-convention */
import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  workspaces: {
    '.': {
      entry: ['scripts/*.ts']
    },
    backend: {
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
    frontend: {
      entry: [
        'src/main.ts',
        'src/common/layouts/*.vue',
        'src/user/home/pages/**/*.vue',
        'src/user/notice/pages/**/*.vue',
        'src/user/problem/pages/**/*.vue',
        'src/user/contest/pages/**/*.vue',
        'src/user/group/pages/**/*.vue',
        'src/user/workbook/pages/**/*.vue',
        'src/admin/pages/**/*.vue',
        'histoire.config.ts',
        'src/histoire.setup.ts'
      ],
      project: ['**/*.{vue,ts}'],
      ignore: ['**/*.story.vue'],
      ignoreDependencies: [
        'virtual:generated-layouts',
        'virtual:generated-pages',
        '@iconify-json/ant-design',
        '@iconify-json/bi',
        '@iconify-json/fa',
        '@iconify-json/fa6-brands',
        '@iconify-json/fa6-regular',
        '@iconify-json/fa6-solid',
        '@iconify-json/fluent',
        '@iconify-json/iconoir',
        '@iconify-json/material-symbols',
        '@iconify-json/ri'
      ], // TODO: handle icon packages
      paths: {
        '@/*': ['src/*']
      }
    },
    'frontend-client': {
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
  },
  compilers: {
    vue: (text) => {
      const vueCompiler = /<script\b[^>]*>([\s\S]*?)<\/script>/gm
      const scripts: string[] = []
      let match
      while ((match = vueCompiler.exec(text))) scripts.push(match[1])
      return scripts.join(';')
    }
  }
}

export default config
