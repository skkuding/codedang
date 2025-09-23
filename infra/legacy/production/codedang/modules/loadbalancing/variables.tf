variable "lb" {
  type = object({
    name    = string
    subnets = list(string)
  })
  description = "The load balancer. e.g. {name='codedang-lb', subnets=['subnet-12345678']}"
}

variable "lb_target_group" {
  type = object({
    name              = string
    port              = number
    health_check_path = string
  })
  description = "The target group for load balancer. e.g. {name='codedang-tg', port=1234, health_check_path='/'}"
}

variable "security_group" {
  type = object({
    name = string
  })
  description = "The security group for load balancer. e.g. {name='codedang-sg'}"
}
