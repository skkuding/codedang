resource "sentry_project" "frontend" {
  organization = data.sentry_organization.skkuding.slug
  teams        = [sentry_team.codedang.slug]

  name     = "frontend"
  slug     = "frontend"
  platform = "javascript-nextjs"

  # Alert rules and client keys are declared in Terraform instead of being
  # created implicitly by Sentry.
  default_rules = false
  default_key   = false
}

resource "sentry_key" "frontend" {
  organization = data.sentry_organization.skkuding.slug
  project      = sentry_project.frontend.slug

  name = "frontend"
}
