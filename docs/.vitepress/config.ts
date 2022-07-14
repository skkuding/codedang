import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Coding Platform',
  themeConfig: {
    nav: [
      {
        text: '🖊  GitHub',
        link: 'https://github.com/skkuding/next'
      },
      {
        text: '📑  Coding Platform',
        link: 'https://npc.skku.edu'
      }
    ],
    sidebar: [
      {
        text: 'Introduction',
        items: [
          {
            text: 'What is Coding Platform?',
            link: '/introduction/coding-platform'
          },
          {
            text: 'Contributing Guide',
            link: '/introduction/contributing-guide'
          },
          { text: 'Getting Started', link: '/introduction/getting-started' },
          { text: 'Deploy', link: '/introduction/deploy' }
        ]
      },
      {
        text: 'User Use case',
        items: [
          {
            text: 'Main',
            link: '/user/main'
          },
          {
            text: 'Notice',
            link: '/user/notice'
          },
          { text: 'Contest', link: '/user/contest' },
          { text: 'Group', link: '/user/group' }
        ]
      },
      {
        text: 'Group Admin Use case',
        items: [
          {
            text: 'Main',
            link: '/group-admin/main'
          },
          {
            text: 'Notice',
            link: '/group-admin/notice'
          },
          { text: 'Problem', link: '/group-admin/problem' },
          { text: 'Contest', link: '/group-admin/contest' },
          { text: 'Workbook', link: '/group-admin/workbook' },
          { text: 'Group', link: '/group-admin/group' }
        ]
      },
      {
        text: 'Project Planning',
        items: [
          {
            text: 'Main',
            link: '/project-planning/main'
          }
        ]
      }
    ]
  },
  vite: {
    server: {
      // configure vite for HMR with Gitpod
      hmr: process.env.GITPOD_HOST
        ? {
            // removes the protocol and replaces it with the port we're connecting to
            host: process.env.GITPOD_WORKSPACE_URL?.replace(
              'https://',
              '5555-'
            ),
            protocol: 'wss',
            clientPort: 443
          }
        : true
    }
  }
})
