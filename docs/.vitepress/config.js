export default {
  base: '/next/',
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
            { text: 'What is Coding Platform?', link: '/introduction/coding-platform'},
            { text: 'Contributing Guide', link: '/introduction/contributing-guide'},
            { text: 'Getting Started', link: '/introduction/getting-started'},
        ]
      },
      {
        text: '[FE] Atom',
        items: [
          { text: 'Button', link:'/frontend/Atom/button'},
          // please add Atom items
        ]
      },
      {
        text: '[FE] Molecule',
        items: [
          { text: 'Progress Card', link:'/frontend/Molecule/card-progress'},
          // please add Molecule items
        ]
      },
      {
        text: '[FE] Organism',
        items: [
          { text: 'Header', link:'/frontend/Organism/header'},
          // please add Organism items
        ]
      },
      {
        text: '[BE] API',
        items: [
          { text: 'Contest', link:'/backend/API/contest'},
          // please add API items
        ]
      }
    ]
  }
}
