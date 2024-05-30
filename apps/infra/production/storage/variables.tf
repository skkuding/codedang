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
