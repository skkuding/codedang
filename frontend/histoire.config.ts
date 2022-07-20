import { defineConfig } from 'histoire'

export default defineConfig({
  setupFile: '/src/histoire.setup.ts',
  theme: {
    title: 'SKKUding Histoire'
  },
  vite: {
    server: {
      // configure vite for HMR with Gitpod
      hmr: process.env.GITPOD_HOST
        ? {
            // removes the protocol and replaces it with the port we're connecting to
            host: process.env.GITPOD_WORKSPACE_URL?.replace(
              'https://',
              '3030-'
            ),
            protocol: 'wss',
            clientPort: 443
          }
        : true
    }
  }
})
