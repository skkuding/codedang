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

variable "rabbitmq_port" {
  type      = string
  default   = "5671"
  sensitive = true
}

variable "region" {
  type        = string
  description = "The region for provider"
  default     = "ap-northeast-2"
}

variable "env" { sensitive = true }
