variable "profile" {
  type    = string
  default = "default"
}

variable "region" {
  type    = string
  default = "ap-northeast-2"
}

variable "s3_bucket" {}
variable "postgres_username" {}
# variable "postgres_password" {}
variable "postgres_port" {}
variable "rabbitmq_username" {}
# variable "rabbitmq_password" {}
