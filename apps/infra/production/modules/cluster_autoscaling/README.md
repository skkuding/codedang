# Cluster Autoscaling

Terraform module for Cluster Autoscaling.

ECS Cluster 와 EC2 Autoscaling을 정의하는 모듈입니다. launch template을 이용하여 EC2 인스턴스를 정의하고 이를 `autoscaling_group`에 연결하여 CPU 사용률을 기준으로 자동으로 인스턴스를 스케일링합니다. 이와 함께 ECS 클러스터를 설정하고 `capacity_provider`를 연결하여 autoscaling을 구성합니다.

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
| [aws_autoscaling_group.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/autoscaling_group) | resource |
| [aws_autoscaling_policy.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/autoscaling_policy) | resource |
| [aws_ecs_capacity_provider.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecs_capacity_provider) | resource |
| [aws_ecs_cluster.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecs_cluster) | resource |
| [aws_ecs_cluster_capacity_providers.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecs_cluster_capacity_providers) | resource |
| [aws_launch_template.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/launch_template) | resource |
| [aws_security_group.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/security_group) | resource |
| [aws_subnet.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/subnet) | resource |
| [aws_vpc.main](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/vpc) | data source |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_autoscaling_group"></a> [autoscaling\_group](#input\_autoscaling\_group) | The autoscaling group. e.g. {name='codedang-asg', max\_size=7} | <pre>object({<br>    name     = string<br>    max_size = number<br>  })</pre> | n/a | yes |
| <a name="input_autoscaling_policy"></a> [autoscaling\_policy](#input\_autoscaling\_policy) | The autoscaling policy with target tracking avg cpu utilization. e.g. {name='codedang-asp', target\_value=70} | <pre>object({<br>    name         = string<br>    target_value = number<br>  })</pre> | n/a | yes |
| <a name="input_ecs_capacity_provider_name"></a> [ecs\_capacity\_provider\_name](#input\_ecs\_capacity\_provider\_name) | The name of the ECS capacity provider. e.g. codedang-cp | `string` | n/a | yes |
| <a name="input_ecs_cluster_name"></a> [ecs\_cluster\_name](#input\_ecs\_cluster\_name) | The name for the ECS cluster. e.g. codedang-cl | `string` | n/a | yes |
| <a name="input_launch_template"></a> [launch\_template](#input\_launch\_template) | The EC2 launch template configuration. e.g. {name='codedang-lt', key\_name='codedang-key', iam\_instance\_profile\_name='ecs-instance-profile', tags\_name='codedang-config'} | <pre>object({<br>    name     = string<br>    key_name = string<br><br>    iam_instance_profile_name = string<br>    tags_name                 = string<br>  })</pre> | n/a | yes |
| <a name="input_security_group"></a> [security\_group](#input\_security\_group) | The security group for launch template network inteface. e.g. {name='codedang-sg', description='codedang allow you', ingress={description='from you', from\_port=11111, to\_port=22222, protocol='tcp'}} | <pre>object({<br>    name        = string<br>    description = string<br><br>    ingress = object({<br>      description = string<br>      from_port   = string<br>      to_port     = string<br>      protocol    = string<br><br>      security_groups = optional(list(string))<br>      cidr_blocks     = optional(list(string))<br><br>      ipv6_cidr_blocks = optional(list(string), [])<br>      prefix_list_ids  = optional(list(string), [])<br>      self             = optional(bool, false)<br>    })<br>  })</pre> | n/a | yes |
| <a name="input_subnets"></a> [subnets](#input\_subnets) | The map of subnets. e.g. {codedang\_subnet={cidr\_block='10.0.1.0/24', availability\_zone='ap-northeast-2a', tags\_name='codedang-sub'}} | <pre>map(object({<br>    cidr_block        = string<br>    availability_zone = string<br>    tags_name         = string<br>  }))</pre> | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_ecs_cluster"></a> [ecs\_cluster](#output\_ecs\_cluster) | n/a |
