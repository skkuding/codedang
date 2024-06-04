variable "launch_template" {
  type = object({
    name     = string
    key_name = string

    iam_instance_profile_name = string
    tags_name                 = string
  })
}

variable "autoscaling_group" {
  type = object({
    name     = string
    max_size = number
  })
}

variable "autoscaling_policy" {
  type = object({
    name         = string
    target_value = number
  })
}

variable "ecs_cluster_name" {
  type = string
}

variable "ecs_capacity_provider_name" {
  type = string
}

variable "subnets" {
  type = map(object({
    cidr_block        = string
    availability_zone = string
    tags_name         = string
  }))
}

variable "security_group" {
  type = object({
    name        = string
    description = string
    tags_name   = string

    ingress = object({
      description = string
      from_port   = string
      to_port     = string
      protocol    = string

      security_groups = optional(list(string))
      cidr_blocks     = optional(list(string))

      ipv6_cidr_blocks = optional(list(string), [])
      prefix_list_ids  = optional(list(string), [])
      self             = optional(bool, false)
    })
  })
}
