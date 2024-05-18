# ###################### cloudwatch alert ######################
# resource "aws_cloudwatch_metric_alarm" "ecs_admin_api_scale_down" {
#   alarm_name          = "Codedang-Admin-Api-Service-Scale-Down-Alert"
#   comparison_operator = "LessThanThreshold"
#   datapoints_to_alarm = 10
#   evaluation_periods  = 10
#   metric_name         = "CPUUtilization"
#   namespace           = "AWS/ECS"
#   period              = 60
#   statistic           = "Average"
#   threshold           = 50
#   alarm_description   = "This metric monitors task cpu utilization and scale down ecs service"
#   alarm_actions       = [aws_appautoscaling_policy.service_asp_admin_api_scale_down.arn]

#   dimensions = {
#     ClusterName = aws_ecs_cluster.api.name
#     ServiceName = aws_ecs_service.admin_api.name
#   }
# }

# resource "aws_cloudwatch_metric_alarm" "ecs_admin_api_scale_up" {
#   alarm_name          = "Codedang-Admin-Api-Service-Scale-Up-Alert"
#   comparison_operator = "GreaterThanThreshold"
#   datapoints_to_alarm = 1
#   evaluation_periods  = 1
#   metric_name         = "CPUUtilization"
#   namespace           = "AWS/ECS"
#   period              = 60
#   statistic           = "Maximum"
#   threshold           = 120
#   alarm_description   = "This metric monitors task cpu utilization and scale up ecs service"
#   alarm_actions       = [aws_appautoscaling_policy.service_asp_admin_api_scale_up.arn]

#   dimensions = {
#     ClusterName = aws_ecs_cluster.api.name
#     ServiceName = aws_ecs_service.admin_api.name
#   }
# }

# ###################### Service Auto Scaling #####################
# resource "aws_appautoscaling_target" "service_asg_admin_api" {
#   max_capacity       = 8
#   min_capacity       = 1
#   resource_id        = "service/${aws_ecs_cluster.api.name}/${aws_ecs_service.admin_api.name}"
#   scalable_dimension = "ecs:service:DesiredCount"
#   service_namespace  = "ecs"
# }

# resource "aws_appautoscaling_policy" "service_asp_admin_api_scale_up" {
#   name               = "scale-up"
#   policy_type        = "StepScaling"
#   resource_id        = aws_appautoscaling_target.service_asg_admin_api.resource_id
#   scalable_dimension = aws_appautoscaling_target.service_asg_admin_api.scalable_dimension
#   service_namespace  = aws_appautoscaling_target.service_asg_admin_api.service_namespace

#   step_scaling_policy_configuration {
#     adjustment_type         = "ChangeInCapacity"
#     cooldown                = 60
#     metric_aggregation_type = "Average"

#     step_adjustment {
#       metric_interval_lower_bound = 0
#       scaling_adjustment          = 1
#     }
#   }
# }

# resource "aws_appautoscaling_policy" "service_asp_admin_api_scale_down" {
#   name               = "scale-down"
#   policy_type        = "StepScaling"
#   resource_id        = aws_appautoscaling_target.service_asg_admin_api.resource_id
#   scalable_dimension = aws_appautoscaling_target.service_asg_admin_api.scalable_dimension
#   service_namespace  = aws_appautoscaling_target.service_asg_admin_api.service_namespace

#   step_scaling_policy_configuration {
#     adjustment_type         = "ChangeInCapacity"
#     cooldown                = 30
#     metric_aggregation_type = "Average"

#     step_adjustment {
#       metric_interval_upper_bound = -30
#       scaling_adjustment          = -1
#     }
#   }
# }
