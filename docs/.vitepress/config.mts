import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Codedang 코드당',
  description: 'Codedang Document for Developers',
  titleTemplate: false,
  lastUpdated: true,

  head: [
    ['link', { rel: 'icon', href: '/logo.png' }],
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
    logo: '/logo.png',
    nav: [
      {
        text: '📌 Guide',
        link: '/intro/'
      },
      {
        text: '💡 Demo',
        link: 'https://codedang.com'
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
          },
          {
            text: 'API Documentation',
            link: '/intro/bruno'
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
            text: 'Stage Server',
            link: '/project/stage-server'
          },
          {
            text: 'Project Roadmap',
            link: '/project/roadmap'
          }
        ]
      },
      {
        text: '학생 매뉴얼',
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
        text: '관리자 매뉴얼',
        items: [
          {
            text: '가입 및 로그인',
            link: '/group-admin/login'
          },
          { text: '그룹 및 멤버 관리', link: '/group-admin/group' },
          { text: '문제 생성 및 관리', link: '/group-admin/problem' },
          {
            text: 'Notice',
            link: '/group-admin/notice'
          },
          { text: 'Contest', link: '/group-admin/contest' },
          { text: 'Workbook', link: '/group-admin/workbook' }
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
