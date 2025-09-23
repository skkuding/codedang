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
    name             = string
    max_size         = number
    desired_capacity = number
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
  type        = list(string)
  description = "List of subnet names. e.g. ['private_api1', 'private_api2']"
}

variable "security_groups" {
  type        = list(string)
  description = "List of SG names. e.g. ['sg_db', 'sg_redis']"
}