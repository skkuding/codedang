variable "profile" {
  type    = string
  default = "default"
}

variable "region" {
  type    = string
  default = "ap-northeast-1"
}

variable "s3_bucket" {}
variable "postgres_username" {}
variable "postgres_port" {}
variable "redis_port" {}
variable "rabbitmq_username" {}
variable "rabbitmq_port" {}

variable "ecr_client_uri" {
  type    = string
  default = "default"
}

variable "ecr_admin_uri" {
  type    = string
  default = "default"
}

variable "ecr_iris_uri" {
  type    = string
  default = "default"
}
