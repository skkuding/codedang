variable "postgres_username" {
  description = "Username for Postgres DB"
  type        = string
  default     = "skkuding"
  sensitive   = true
}

variable "postgres_port" {
  description = "Port for Postgres DB"
  type        = number
  default     = 5433
  sensitive   = true
}

variable "redis_port" {
  description = "Port for Redis"
  type        = number
  default     = 6379
  sensitive   = true
}

variable "region" {
  type        = string
  description = "The region for provider"
  default     = "ap-northeast-2"
}


variable "repository_names" {
  description = "Names of ECR repositories"
  type        = list(string)
  default     = ["codedang-admin-api", "codedang-client-api", "codedang-iris", "codedang-plag"]
}
