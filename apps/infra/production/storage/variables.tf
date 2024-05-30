variable "postgres_username" {
  description = "Username for Postgres DB"
  type        = string
  default     = "skkuding"
}

variable "postgres_port" {
  description = "Port for Postgres DB"
  type        = string
  default     = "5432"
  sensitive   = true
}

variable "redis_port" {
  description = "Port for Redis"
  type        = string
  default     = "6379"
  sensitive   = true
}
