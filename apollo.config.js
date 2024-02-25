module.exports = {
  client: {
    includes: ['./frontend/**/*.ts', './frontend/**/*.tsx'],
    excludes: ['**/__generated__/**'],
    service: {
      name: 'codedang-graphql-app',
      url: 'https://dev.codedang.com/graphql'
    }
  }
}
