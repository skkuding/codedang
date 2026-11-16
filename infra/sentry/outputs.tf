# The public DSN ships inside the browser bundle, so it is not a secret.
output "frontend_dsn" {
  value = nonsensitive(sentry_key.frontend.dsn["public"])
}
