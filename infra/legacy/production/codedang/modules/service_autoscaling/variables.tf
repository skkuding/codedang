variable "task_definition" {
  type = object({
    family                = string
    cpu                   = optional(number)
    memory                = optional(number)
    container_definitions = any
    execution_role_arn    = string
  })
  description = "The task definition. e.g. {family='codedang-fam', memory=512, container_definitions=file('./codedang-cd.json'), execution_role_arn='arn:aws:iam:12345678'}"
}

variable "task_role" {
  type = object({
    iam_role = object({
      name        = string
      description = string
    })

    iam_policy = object({
      name   = string
      policy = string
    })
  })
  default     = null
  description = "The IAM role and policy information for ECS tasks, controlling permissions for containers executed within tasks."
}

variable "ecs_service" {
  type = object({
    name          = string
    cluster_arn   = string
    desired_count = number

    load_balancer = optional(object({
      container_name   = string
      container_port   = number
      target_group_arn = string
    }), null)
  })
  description = "The ECS service configuration. e.g. {name='codedang-ecs', cluster_arn='arn:aws:ecs:ap-northeast-2:12345678', desired_count=1}"
}

variable "appautoscaling_target" {
  type = object({
    min_capacity = number
    max_capacity = number
    resource_id = object({
      cluster_name = string
    })
  })
  description = "The application autoscaling target. e.g. {min_capacity=1, max_capacity=7, resource_id='service/codedang-cl/codedang-ecs'}"
}


variable "scale_down" {
  type = object({
    cloudwatch_metric_alarm = object({
      alarm_name        = string
      alarm_description = string

      datapoints_to_alarm = number
      evaluation_periods  = number
      threshold           = number

      dimensions = object({
        cluster_name = string
      })
    })
  })
  description = "The settings for scaling down ECS tasks, including cloudwatch metric alarm."
}

variable "scale_up" {
  type = object({
    cloudwatch_metric_alarm = object({
      alarm_name        = string
      alarm_description = string
      threshold         = number
      statistic         = optional(string, "Maximum")

      dimensions = object({
        cluster_name = string
      })
    })
  })
  description = "The settings for scaling up ECS tasks, including cloudwatch metric alarm."
}

