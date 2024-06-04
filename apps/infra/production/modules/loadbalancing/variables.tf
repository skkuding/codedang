variable "lb" {
  type = object({
    name    = string
    subnets = list(string)
  })
}

variable "lb_target_group" {
  type = object({
    name              = string
    port              = number
    health_check_path = string
  })
}

variable "security_group" {
  type = object({
    name      = string
    tags_name = string
  })
}
