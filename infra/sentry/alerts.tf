# The default error monitor Sentry creates for each project. depends_on defers
# the lookup until the project exists.
data "sentry_project_error_monitor" "frontend" {
  organization = data.sentry_organization.skkuding.slug
  project      = sentry_project.frontend.slug

  depends_on = [sentry_project.frontend]
}

# Emails new and regressed frontend issues. Remove it if issue notifications
# become too noisy; uptime alerts are declared separately.
resource "sentry_alert" "frontend_issues" {
  organization = data.sentry_organization.skkuding.slug
  name         = "frontend: new or regressed issues"

  monitor_ids       = [data.sentry_project_error_monitor.frontend.id]
  frequency_minutes = 30

  trigger_conditions = [
    { first_seen_event = {} },
    { regression_event = {} },
  ]

  action_filters = [
    {
      logic_type = "any"
      actions = [
        {
          email = {
            target_type      = "issue_owners"
            fallthrough_type = "ActiveMembers"
          }
        },
      ]
    },
  ]
}
