variable "rabbitmq_username" {
  type    = string
  default = "skkuding"
}

variable "rabbitmq_port" {
  type      = string
  default   = "5671"
  sensitive = true
}

variable "rabbitmq_arguments" {
  default = <<EOF
{
  "x-max-priority": 3
}
EOF
}

# TODO: description 넣고 공통부분은 object로 처리
variable "public_subnet1" { sensitive = true }
variable "public_subnet2" { sensitive = true }
variable "database_url" { sensitive = true }
variable "redis_host" { sensitive = true }
variable "redis_port" { sensitive = true }
variable "jwt_secret" { sensitive = true }
variable "rabbitmq_host" { sensitive = true }
variable "rabbitmq_password" { sensitive = true }
variable "rabbitmq_vhost" { sensitive = true }
variable "rabbitmq_api_url" { sensitive = true }
variable "github_client_id" { sensitive = true }
variable "github_client_secret" { sensitive = true }
variable "kakao_client_id" { sensitive = true }
variable "kakao_client_secret" { sensitive = true }
variable "otel_exporter_otlp_endpoint_url" { sensitive = true }
variable "loki_url" { sensitive = true }

variable "testcase_bucket_name" { sensitive = true }
variable "testcase_access_key" { sensitive = true }
variable "testcase_secret_key" { sensitive = true }
variable "testcase_bucket_arn" { sensitive = true }
variable "media_bucket_name" { sensitive = true }
variable "media_access_key" { sensitive = true }
variable "media_secret_key" { sensitive = true }
