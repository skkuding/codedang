variable "profile" {
  type    = string
  default = "default"
}

variable "region" {
  type    = string
  default = "ap-northeast-2"
}

variable "postgres_username" {}
variable "postgres_port" {}
variable "redis_port" {}
variable "rabbitmq_username" {}
variable "rabbitmq_port" {}
variable "github_client_id" {}
variable "github_client_secret" {}
variable "kakao_client_id" {}
variable "kakao_client_secret" {}
