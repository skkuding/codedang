variable "profile" {
  type    = string
  default = "default"
}

variable "s3_bucket" {
  type    = string
  default = "codedang"
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
