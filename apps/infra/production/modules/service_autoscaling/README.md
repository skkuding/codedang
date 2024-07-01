# Service Autoscaling

Terraform module for Service Autoscaling.

ECS service 와 application autoscaling을 정의하는 모듈입니다. ECS의 task와 service를 설정하고, cloudwatch 및 appautoscaling 정책을 구성합니다. cloudwatch metric 알람이 cpu 사용률이 `threshold`를 기준으로 스케일링이 실행됩니다.

## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_aws"></a> [aws](#requirement\_aws) | ~>5.0 |

## Providers

| Name | Version |
|------|---------|
| <a name="provider_aws"></a> [aws](#provider\_aws) | ~>5.0 |

## Modules

No modules.

## Resources

| Name | Type |
|------|------|
| [aws_appautoscaling_policy.scale_down](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/appautoscaling_policy) | resource |
| [aws_appautoscaling_policy.scale_up](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/appautoscaling_policy) | resource |
| [aws_appautoscaling_target.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/appautoscaling_target) | resource |
| [aws_cloudwatch_metric_alarm.scale_down](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_metric_alarm) | resource |
| [aws_cloudwatch_metric_alarm.scale_up](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_metric_alarm) | resource |
| [aws_ecs_service.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecs_service) | resource |
| [aws_ecs_task_definition.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecs_task_definition) | resource |
| [aws_iam_policy.task_role](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_policy) | resource |
| [aws_iam_role.task_role](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role) | resource |
| [aws_iam_role_policy_attachment.task_role](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment) | resource |
| [aws_iam_policy_document.task_assume_role](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/iam_policy_document) | data source |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_appautoscaling_target"></a> [appautoscaling\_target](#input\_appautoscaling\_target) | The application autoscaling target. e.g. {min\_capacity=1, max\_capacity=7, resource\_id='service/codedang-cl/codedang-ecs'} | <pre>object({<br>    min_capacity = number<br>    max_capacity = number<br>    resource_id = object({<br>      cluster_name = string<br>    })<br>  })</pre> | n/a | yes |
| <a name="input_ecs_service"></a> [ecs\_service](#input\_ecs\_service) | The ECS service configuration. e.g. {name='codedang-ecs', cluster\_arn='arn:aws:ecs:ap-northeast-2:12345678', desired\_count=1} | <pre>object({<br>    name          = string<br>    cluster_arn   = string<br>    desired_count = number<br><br>    load_balancer = optional(object({<br>      container_name   = string<br>      container_port   = number<br>      target_group_arn = string<br>    }), null)<br>  })</pre> | n/a | yes |
| <a name="input_scale_down"></a> [scale\_down](#input\_scale\_down) | The settings for scaling down ECS tasks, including cloudwatch metric alarm. | <pre>object({<br>    cloudwatch_metric_alarm = object({<br>      alarm_name        = string<br>      alarm_description = string<br><br>      datapoints_to_alarm = number<br>      evaluation_periods  = number<br>      threshold           = number<br><br>      dimensions = object({<br>        cluster_name = string<br>      })<br>    })<br>  })</pre> | n/a | yes |
| <a name="input_scale_up"></a> [scale\_up](#input\_scale\_up) | The settings for scaling up ECS tasks, including cloudwatch metric alarm. | <pre>object({<br>    cloudwatch_metric_alarm = object({<br>      alarm_name        = string<br>      alarm_description = string<br>      threshold         = number<br>      statistic         = optional(string, "Maximum")<br><br>      dimensions = object({<br>        cluster_name = string<br>      })<br>    })<br>  })</pre> | n/a | yes |
| <a name="input_task_definition"></a> [task\_definition](#input\_task\_definition) | The task definition. e.g. {family='codedang-fam', memory=512, container\_definitions=file('./codedang-cd.json'), execution\_role\_arn='arn:aws:iam:12345678'} | <pre>object({<br>    family                = string<br>    cpu                   = optional(number)<br>    memory                = number<br>    container_definitions = any<br>    execution_role_arn    = string<br>  })</pre> | n/a | yes |
| <a name="input_task_role"></a> [task\_role](#input\_task\_role) | The IAM role and policy information for ECS tasks, controlling permissions for containers executed within tasks. | <pre>object({<br>    iam_role = object({<br>      name        = string<br>      description = string<br>    })<br><br>    iam_policy = object({<br>      name   = string<br>      policy = string<br>    })<br>  })</pre> | `null` | no |

## Outputs

No outputs.
