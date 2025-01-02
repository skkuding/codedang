variable "rabbitmq_username" {
  type    = string
  default = "skkuding"
}

variable "rabbitmq_port" {
  type      = string
  default   = "5671"
  sensitive = true
}

# TODO: description 넣고 공통부분은 object로 처리
variable "redis_port" { sensitive = true }
variable "jwt_secret" { sensitive = true }
variable "otel_exporter_otlp_endpoint_url" { sensitive = true }
variable "loki_url" { sensitive = true }

variable "github_client_id" { sensitive = true }
variable "github_client_secret" { sensitive = true }
variable "kakao_client_id" { sensitive = true }
variable "kakao_client_secret" { sensitive = true }

variable "env" { sensitive = true }
