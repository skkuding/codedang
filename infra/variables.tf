variable "profile" {
  type    = string
  default = "default"
}

variable "s3_bucket" {
  type    = string
  default = "codedang"
}

variable "ecr_client_uri" {
  type    = string
  default = "xxx"
}

variable "ecr_admin_uri" {
  type    = string
  default = "xxx"
}

variable "region" {
  type    = string
  default = "ap-northeast-2"
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

variable "postgres_password" {
  description = "Password for Postgres DB"
  type        = string
  default     = "password"
}

variable "postgres_port" {
  description = "Port for Postgres DB"
  type        = string
  default     = "5432"
}

variable "redis_port" {
  description = "Port for Redis"
  type        = string
  default     = "6379"
}


variable "ecr_iris_uri" {
  type    = string
  default = "xxx"
}

variable "rabbitmq_port" {
  type    = string
  default = "5671"
}

variable "rabbitmq_username" {
  type    = string
  default = "skkuding"
}

variable "rabbitmq_password" {
  type    = string
  default = "abcd12345678"
}

variable "rabbitmq_vhost" {
  type    = string
  default = "vh"
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

