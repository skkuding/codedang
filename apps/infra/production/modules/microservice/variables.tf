variable "appautoscaling_target" {
  type = object({
    min_capacity = number
    max_capacity = number
    resource_id  = string
  })
}

variable "task_definition" {
  type = object({
    family                = string
    cpu                   = optional(number)
    memory                = number
    container_definitions = any
    execution_role_arn    = string
  })
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
}

variable "scale_up" {
  type = object({
    cloudwatch_metric_alarm = object({
      alarm_name        = string
      alarm_description = string
      threshold         = number

      dimensions = object({
        cluster_name = string
      })
    })
  })
}

variable "ecs_service" {
  type = object({
    name          = string
    cluster_arn   = string
    desired_count = number
  })
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
  default = null
}
