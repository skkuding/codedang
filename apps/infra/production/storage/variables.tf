variable "postgres_username" {
  description = "Username for Postgres DB"
  type        = string
  default     = "skkuding"
}

variable "postgres_port" {
  description = "Port for Postgres DB"
  type        = number
  default     = 5432
}

variable "redis_port" {
  description = "Port for Redis"
  type        = number
  default     = 6379
}
