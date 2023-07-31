resource "random_password" "jwt_secret" {
  length  = 32
  special = true
}

resource "random_password" "postgres_password" {
  length  = 16
  special = false
}

resource "random_password" "rabbitmq_password" {
  length  = 16
  special = false
}
