import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Codedang',
  description: 'Codedang Document for Developers',
  titleTemplate: false,
  lastUpdated: true,

  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    [
      'link',
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: ''
      }
    ],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap'
      }
    ]
  ],

  themeConfig: {
    nav: [
      {
        text: '📌 Guide',
        link: '/intro/'
      },
      {
        text: '📦 API',
        link: '/api/'
      }
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/skkuding/next' }],
    sidebar: [
      {
        text: 'Introduction',
        items: [
          {
            text: 'What is Coding Platform?',
            link: '/intro/'
          },
          {
            text: 'Getting Started',
            link: '/intro/getting-started'
          },
          {
            text: 'Contributing Guide',
            link: 'https://github.com/skkuding/next/blob/main/CONTRIBUTING.md'
          }
        ]
      },
      {
        text: 'Project',
        items: [
          {
            text: 'Tech Stack',
            link: '/project/tech-stack'
          },
          {
            text: 'Hierarchy',
            link: '/project/hierarchy'
          },
          {
            text: 'How Deployments Work',
            link: '/project/deploy'
          },
          {
            text: 'Project Roadmap',
            link: '/project/roadmap'
          }
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
      }
    ]
  },
  vite: {
    server: {
      host: true
    }
  }
})
