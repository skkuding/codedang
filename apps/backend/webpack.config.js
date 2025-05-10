const swcDefaultConfig =
  require('@nestjs/cli/lib/compiler/defaults/swc-defaults').swcDefaultsFactory()
    .swcOptions

module.exports = {
  // Somehow loading native binaries(*.node) in MacOS ARM64 is not working
  // so let's use workaround to load them manually
  externals: {
    argon2: 'require("argon2")',
    '@apollo/gateway': 'require("@apollo/gateway")',
    '@apollo/subgraph': 'require("@apollo/subgraph")',
    '@apollo/subgraph/package.json': 'require("@apollo/subgraph/package.json")',
    '@apollo/subgraph/dist/directives':
      'require("@apollo/subgraph/dist/directives")',
    '@as-integrations/fastify': 'require("@as-integrations/fastify")',
    '@css-inline/css-inline-darwin-arm64':
      'require("@css-inline/css-inline-darwin-arm64")'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'swc-loader',
          options: swcDefaultConfig
        }
      }
    ]
  }
}
