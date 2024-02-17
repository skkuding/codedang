variable "region" {
  type = string
  # default = "ap-northeast-2"
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
  default     = ["ap-northeast-2a", "ap-northeast-2b", "ap-northeast-2c"] # 추가 서브넷에 대한 가용 영역 목록을 지정합니다.
}

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

variable "nodemailer_from" {
  description = "Email address for nodemailer"
  type        = string
  default     = "Codedang <noreply@codedang.com>"
}

variable "rabbitmq_port" {
  type      = string
  default   = "5671"
  sensitive = true
}

variable "rabbitmq_username" {
  type    = string
  default = "skkuding"
}

variable "rabbitmq_exchage_name" {
  type    = string
  default = "iris.e.direct.judge"
}

variable "rabbitmq_result_queue_name" {
  type    = string
  default = "iris.q.judge.result"
}

variable "rabbitmq_consumer_queue_name" {
  type    = string
  default = "client.q.judge.submission"
}

variable "rabbitmq_result_routing_key" {
  type    = string
  default = "judge.result"
}

variable "rabbitmq_submission_routing_key" {
  type    = string
  default = "judge.submission"
}

variable "github_client_id" {
  type      = string
  default   = "github_client_id"
  sensitive = true
}

variable "github_client_secret" {
  type      = string
  default   = "github_client_secret"
  sensitive = true
}

variable "loki_url" {
  type    = string
  default = "https://grafana.codedang.com/lokiaws/loki/api/v1/push"
}

variable "kakao_client_id" {
  type      = string
  default   = "kakao_client_id"
  sensitive = true
}

variable "kakao_client_secret" {
  type      = string
  default   = "kakao_client_secret"
  sensitive = true
}
