import {
  to = aws_lb.admin_api
  id = "arn:aws:elasticloadbalancing:ap-northeast-2:219857217698:loadbalancer/app/Codedang-Admin-Api-LB/d10e76f4d4032aa3"
}

import {
  to = aws_lb.client_api
  id = "arn:aws:elasticloadbalancing:ap-northeast-2:219857217698:loadbalancer/app/Codedang-Client-Api-LB/e90386605902e695"
}

import {
  to = aws_lb_target_group.admin_api
  id = "arn:aws:elasticloadbalancing:ap-northeast-2:219857217698:targetgroup/Codedang-Admin-Api-TG/3b71406007fde668"
}

import {
  to = aws_lb_target_group.client_api
  id = "arn:aws:elasticloadbalancing:ap-northeast-2:219857217698:targetgroup/Codedang-Client-Api-TG/97321e916ceb9a15"
}

import {
  to = aws_lb_listener.admin_api
  id = "arn:aws:elasticloadbalancing:ap-northeast-2:219857217698:listener/app/Codedang-Admin-Api-LB/d10e76f4d4032aa3/3103cd09c86f93a0"
}

import {
  to = aws_lb_listener.client_api
  id = "arn:aws:elasticloadbalancing:ap-northeast-2:219857217698:listener/app/Codedang-Client-Api-LB/e90386605902e695/5d6fbfd1d301b732"
}

import {
  to = aws_mq_broker.judge_queue
  id = "b-12da81e3-d6b9-4309-a60b-e9e294c60613"
}

import {
  to = aws_mq_configuration.judge_queue
  id = "c-dd22323f-9824-4a9d-aeb0-ebf7f611b526"
}

import {
  to = aws_secretsmanager_secret.judge_queue
  id = "arn:aws:secretsmanager:ap-northeast-2:219857217698:secret:Codedang-JudgeQueue-Secret-HMPqFl"
}

import {
  to = aws_launch_template.api
  id = "lt-0a301a37c0d2f09fd"
}

import {
  to = aws_launch_template.iris
  id = "lt-03771018e83c4c81d"
}

import {
  to = aws_cloudfront_distribution.stage
  id = "E3MGLL85LUMBTC"
}

import {
  provider = aws.us_east_1
  to       = aws_acm_certificate.stage
  id       = "arn:aws:acm:us-east-1:219857217698:certificate/da31e0e6-04cf-48d1-b3a6-8eb138237cd6"
}

import {
  provider = aws.us_east_1
  to       = aws_acm_certificate.apex
  id       = "arn:aws:acm:us-east-1:219857217698:certificate/a806d187-7523-4e88-8cef-1bc58c7b5dca"
}

import {
  to = aws_subnet.legacy_db_1
  id = "subnet-05ea6bbe2fa48873d"
}

import {
  to = aws_subnet.legacy_db_2
  id = "subnet-0ffccc8c180f60985"
}

import {
  to = aws_subnet.legacy_db_3
  id = "subnet-08566a2f731bad802"
}

import {
  to = aws_iam_role.ecs_container_instance
  id = "Codedang-ECS-Container-Instance-Role"
}

import {
  to = aws_iam_role_policy_attachment.ecs_container_instance
  id = "Codedang-ECS-Container-Instance-Role/arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

import {
  to = aws_iam_instance_profile.ecs_container_instance
  id = "Codedang-ECS-Container-Instance-Profile"
}

import {
  to = aws_iam_role.ecs_task_execution
  id = "Codedang-Api-Task-Execution-Role"
}

import {
  to = aws_iam_role_policy_attachment.ecs_task_execution
  id = "Codedang-Api-Task-Execution-Role/arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

import {
  to = aws_iam_instance_profile.ecs_task_execution
  id = "Codedang-ECS-Task-Execution-Profile"
}
