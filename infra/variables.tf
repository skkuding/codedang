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
  default     = ["ap-northeast-2a", "ap-northeast-2c"] # 추가 서브넷에 대한 가용 영역 목록을 지정합니다.
}


variable "isolated_subnets" {
  type = map(number)
  default = {
    "ap-northeast-2a" = 3
    "ap-northeast-2c" = 4
  }
  description = "Map of AZ to a number that should be used for public subnets"
}

variable "rds_ingress_name" {
  type    = string
  default = "codedang-rds-sg"
}

variable "rds_ingress_ports" {
  type        = number
  default     = 5433
  description = "List of ports opened from Private Subnets CIDR to RDS PosgreSQL Instance"
}

variable "rds_password" {
  type    = string
  default = "12345678"
}

variable "backup_windows_retention_maintenance" {
  type    = list(any)
  default = ["03:00-06:00", "35", "MON:00:00-MON:03:00"]
}

variable "rds_db_instance" {
  type    = string
  default = "db.t3.micro"
}

variable "storage_allocation" {
  type    = list(any)
  default = ["20", "20"]
}

variable "user_name" {
  type    = string
  default = "codedang"
}

variable "private_subnets" {
  type = map(number)
  default = {
    "ap-northeast-2a" = 1
    "ap-northeast-2c" = 2
  }
  description = "Map of AZ to a number that should be used for private subnets"
}

