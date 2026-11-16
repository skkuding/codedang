resource "sentry_team" "codedang" {
  organization = data.sentry_organization.skkuding.slug

  name = "CODEDANG"
  slug = "codedang"
}
