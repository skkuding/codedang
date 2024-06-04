variable "rabbitmq_username" {
  type    = string
  default = "skkuding"
}

variable "rabbitmq_port" {
  type      = string
  default   = "5671"
  sensitive = true
}
