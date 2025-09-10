variable "security_groups" {
  type = map(object({
    name        = string
    tags_name   = string
    description = string
    vpc_id      = string


    ingress = list(object({
      description = string
      from_port   = string
      to_port     = string
      protocol    = string

      security_groups = optional(list(string))
      cidr_blocks     = optional(list(string))

      ipv6_cidr_blocks = optional(list(string), [])
      prefix_list_ids  = optional(list(string), [])
      self             = optional(bool, false)
    }))
  }))
  description = "The security group for launch template network inteface. e.g. {name='codedang-sg', description='codedang allow you', tags_name='codedang-sg', ingress={description='from you', from_port=11111, to_port=22222, protocol='tcp'}}"
}
