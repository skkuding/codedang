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
variable "public_subnet1" {}
variable "public_subnet2" {}
variable "database_url" {}
variable "redis_host" {}
variable "redis_port" {}
variable "jwt_secret" {}
variable "rabbitmq_host" {}
variable "rabbitmq_password" {}
variable "rabbitmq_vhost" {}
variable "rabbitmq_api_url" {}
variable "github_client_id" {}
variable "github_client_secret" {}
variable "kakao_client_id" {}
variable "kakao_client_secret" {}
variable "otel_exporter_otlp_endpoint_url" {}
variable "loki_url" {}

variable "testcase_bucket_name" { default = "" }
variable "testcase_access_key" { default = "" }
variable "testcase_secret_key" { default = "" }
variable "testcase_bucket_arn" { default = "" }
variable "media_bucket_name" { default = "" }
variable "media_access_key" { default = "" }
variable "media_secret_key" { default = "" }
