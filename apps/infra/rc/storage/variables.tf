variable "postgres_username" {
  description = "Username for Postgres DB"
  type        = string
  default     = "skkuding"
  sensitive   = true
}

variable "postgres_port" {
  description = "Port for Postgres DB"
  type        = number
  default     = 5432
  sensitive   = true
}

variable "redis_port" {
  description = "Port for Redis"
  type        = number
  default     = 6379
  sensitive   = true
}

variable "rabbitmq_username" {
  type    = string
  default = "skkuding"
}

variable "repository_names" {
  description = "Names of ECR Repositories"
  type        = list(string)
  default     = ["codedang-admin-api", "codedang-client-api", "codedang-iris"]
}

variable "env" { sensitive = true }