###################### cloudwatch alert ######################
resource "aws_cloudwatch_metric_alarm" "ecs_iris_scale-down" {
  alarm_name          = "Codedang-Iris-Service-Scale-Down-Alert"
  comparison_operator = "LessThanThreshold"
  datapoints_to_alarm = 15
  evaluation_periods  = 15
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 60
  statistic           = "Average"
  threshold           = 45
  alarm_description   = "This metric monitors ec2 cpu utilization and scale down ecs service"
  alarm_actions       = [aws_appautoscaling_policy.service_asp_iris_scale_down.arn]

  dimensions = {
    ClusterName = aws_ecs_cluster.iris.name
    ServiceName = aws_ecs_service.iris.name
  }
}

resource "aws_cloudwatch_metric_alarm" "ecs_iris_scale-up" {
  alarm_name          = "Codedang-Iris-Service-Scale-Up-Alert"
  comparison_operator = "GreaterThanThreshold"
  datapoints_to_alarm = 1
  evaluation_periods  = 1
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 60
  statistic           = "Average"
  threshold           = 60
  alarm_description   = "This metric monitors ec2 cpu utilization and scale up ecs service"
  alarm_actions       = [aws_appautoscaling_policy.service_asp_iris_scale_up.arn]

  dimensions = {
    ClusterName = aws_ecs_cluster.iris.name
    ServiceName = aws_ecs_service.iris.name
  }
}

###################### Service Auto Scaling #####################
resource "aws_appautoscaling_target" "service_asg_iris" {
  max_capacity       = 8
  min_capacity       = 2
  resource_id        = "service/${aws_ecs_cluster.iris.name}/${aws_ecs_service.iris.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "service_asp_iris_scale_up" {
  name               = "scale-up"
  policy_type        = "StepScaling"
  resource_id        = aws_appautoscaling_target.service_asg_iris.resource_id
  scalable_dimension = aws_appautoscaling_target.service_asg_iris.scalable_dimension
  service_namespace  = aws_appautoscaling_target.service_asg_iris.service_namespace

  step_scaling_policy_configuration {
    adjustment_type          = "ChangeInCapacity"
    cooldown                 = 60
    metric_aggregation_type  = "Average"
    min_adjustment_magnitude = 0

    step_adjustment {
      metric_interval_lower_bound = 0
      scaling_adjustment          = 1
    }
  }
}

resource "aws_appautoscaling_policy" "service_asp_iris_scale_down" {
  name               = "scale-down"
  policy_type        = "StepScaling"
  resource_id        = aws_appautoscaling_target.service_asg_iris.resource_id
  scalable_dimension = aws_appautoscaling_target.service_asg_iris.scalable_dimension
  service_namespace  = aws_appautoscaling_target.service_asg_iris.service_namespace

  step_scaling_policy_configuration {
    adjustment_type          = "ChangeInCapacity"
    cooldown                 = 60
    metric_aggregation_type  = "Average"
    min_adjustment_magnitude = 0

    step_adjustment {
      metric_interval_upper_bound = -30
      scaling_adjustment          = -1
    }
  }
}
