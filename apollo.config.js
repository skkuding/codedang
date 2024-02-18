module.exports = {
  client: {
    includes: ['./frontend-client/**/*.ts', './frontend-client/**/*.tsx'],
    excludes: ['**/__generated__/**'],
    service: {
      name: 'codedang-graphql-app',
      url: 'https://dev.codedang.com/graphql'
    }
  }
}
