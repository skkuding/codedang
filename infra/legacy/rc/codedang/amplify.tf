# amplify는 기존 앱을 유지하는 것으로 결정

# resource "aws_amplify_app" "codedang" {
#   name       = "codedang-rc-terraform"
#   repository = "https://github.com/skkuding/codedang"
#   platform   = "WEB_COMPUTE"

#   access_token = var.github_access_token

#   # The default build_spec added by the Amplify Console for React.
#   build_spec = <<-EOT
#     version: 1
#     applications:
#       - frontend:
#           phases:
#             preBuild:
#               commands:
#                 - npx pnpm config set node-linker=hoisted
#                 - npx pnpm install
#             build:
#               commands:
#                 - env | grep -e NEXTAUTH_ >> apps/frontend/.env.production
#                 - env | grep -e NEXT_PUBLIC_ >> apps/frontend/.env.production
#                 - env | grep -e NEXT_URL >> apps/frontend/.env.production
#                 - env | grep -e SENTRY_ >> apps/frontend/.env.production
#                 - npx pnpm --filter="@codedang/frontend" run build
#           artifacts:
#             baseDirectory: apps/frontend/.next
#             files:
#               - '**/*'
#           cache:
#             paths:
#               - apps/frontend/.next/cache/**/*
#               - node_modules/**/*
#           buildPath: /
#         appRoot: apps/frontend
#   EOT

#   environment_variables = {
#     AMPLIFY_DIFF_DEPLOY       = "false"
#     AMPLIFY_MONOREPO_APP_ROOT = "apps/frontend"
#     APP_ENV                   = "production"
#     NODE_OPTIONS              = "--max_old_space_size=4096"
#     SENTRY_PROJECT            = "codedang-stage"
#     "_CUSTOM_IMAGE"           = "amplify:al2023"
#     "_LIVE_UPDATES" = jsonencode([
#       { "pkg" : "node",
#         "type" : "nvm",
#     "version" : "20" }])
#     # NEXTAUTH_SECRET         = var.nextauth_secret
#     # NEXTAUTH_URL            = var.nextauth_url
#     # SENTRY_AUTH_TOKEN       = var.sentry_auth_token
#     # NEXT_PUBLIC_BASEURL     = var.next_public_baseurl
#     # NEXT_PUBLIC_GQL_BASEURL = var.next_public_gql_baseurl
#     # NEXT_URL                = var.next_url
#   }
# }

# resource "aws_amplify_branch" "main" {
#   app_id      = aws_amplify_app.codedang.id
#   branch_name = "main"

#   enable_auto_build = true
# }
