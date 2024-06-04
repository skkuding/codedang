variable "launch_template" {
  type = object({
    name     = string
    key_name = string

    iam_instance_profile_name = string
    tags_name                 = string
  })
  description = "The EC2 launch template configuration. e.g. {name='codedang-lt', key_name='codedang-key', iam_instance_profile_name='ecs-instance-profile', tags_name='codedang-config'}"
}

variable "autoscaling_group" {
  type = object({
    name     = string
    max_size = number
  })
  description = "The autoscaling group. e.g. {name='codedang-asg', max_size=7}"
}

variable "autoscaling_policy" {
  type = object({
    name         = string
    target_value = number
  })
  description = "The autoscaling policy with target tracking avg cpu utilization. e.g. {name='codedang-asp', target_value=70}"
}

variable "ecs_cluster_name" {
  type        = string
  description = "The name for the ECS cluster. e.g. codedang-cl"
}

variable "ecs_capacity_provider_name" {
  type        = string
  description = "The name of the ECS capacity provider. e.g. codedang-cp"
}

variable "subnets" {
  type = map(object({
    cidr_block        = string
    availability_zone = string
    tags_name         = string
  }))
  description = "The map of subnets. e.g. {codedang_subnet={cidr_block='10.0.1.0/24', availability_zone='ap-northeast-2a', tags_name='codedang-sub'}}"
}

variable "security_group" {
  type = object({
    name        = string
    description = string

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
  description = "The security group for launch template network inteface. e.g. {name='codedang-sg', description='codedang allow you', ingress={description='from you', from_port=11111, to_port=22222, protocol='tcp'}}"
}
