variable "lb" {
  type = object({
    name    = string
    subnets = list(string)
  })
  description = "The load balancer. e.g. {name='codedang-lb', subnets=['public1', 'public2]}"
}

variable "lb_target_group" {
  type = object({
    name              = string
    port              = number
    health_check_path = string
  })
  description = "The target group for load balancer. e.g. {name='codedang-tg', port=1234, health_check_path='/'}"
}

variable "security_groups" {
  type = list(string)
  description = "List of SG names. e.g. ['sg_db', 'sg_redis']"
}
