# Loadbalancing

Terraform module for Loadbalancing. 

어플리케이션 로드 밸런서를 정의하는 모듈입니다. instance 타입의 `aws_lb_target_group` health 체크를 통해 트래픽을 적절히 분배합니다. 80번 포트의 HTTP 요청을 타겟 그룹으로 포워딩합니다. 

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
| [aws_lb.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb) | resource |
| [aws_lb_listener.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb_listener) | resource |
| [aws_lb_target_group.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb_target_group) | resource |
| [aws_security_group.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/security_group) | resource |
| [aws_vpc.main](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/vpc) | data source |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_lb"></a> [lb](#input\_lb) | The load balancer. e.g. {name='codedang-lb', subnets=['subnet-12345678']} | <pre>object({<br>    name    = string<br>    subnets = list(string)<br>  })</pre> | n/a | yes |
| <a name="input_lb_target_group"></a> [lb\_target\_group](#input\_lb\_target\_group) | The target group for load balancer. e.g. {name='codedang-tg', port=1234, health\_check\_path='/'} | <pre>object({<br>    name              = string<br>    port              = number<br>    health_check_path = string<br>  })</pre> | n/a | yes |
| <a name="input_security_group"></a> [security\_group](#input\_security\_group) | The security group for load balancer. e.g. {name='codedang-sg'} | <pre>object({<br>    name = string<br>  })</pre> | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_security_group_id"></a> [security\_group\_id](#output\_security\_group\_id) | n/a |
| <a name="output_target_group_arn"></a> [target\_group\_arn](#output\_target\_group\_arn) | n/a |
