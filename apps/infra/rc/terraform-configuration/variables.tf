variable "region" {
  type        = string
  description = "The region for provider"
  default     = "ap-northeast-2"
}

variable "env" { sensitive = true }