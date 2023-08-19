/* eslint-disable @typescript-eslint/naming-convention */
import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  workspaces: {
    backend: {
      entry: [
        'apps/{admin,client}/**/{main.ts,app.module.ts}',
        'libs/**/index.ts'
      ],
      project: ['**/*.ts'],
      mocha: {
        config: ['.mocharc.json', 'package.json', 'mocha-fixture.ts']
      }
    },
    frontend: {
      entry: ['src/main.ts'],
      project: ['**/*.{vue,ts}']
    },
    'testcase-server': {
      entry: 'init-testcase.ts'
    }
  },
  ignore: ['**/*.d.ts'],
  ignoreDependencies: ['__fixture__', '__virtual__'],
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
