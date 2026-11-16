# The team already existed before Terraform managed this organization.
import {
  to = sentry_team.codedang
  id = "skkuding/codedang"
}

resource "sentry_team" "codedang" {
  organization = data.sentry_organization.skkuding.slug

  name = "CODEDANG"
  slug = "codedang"
}
