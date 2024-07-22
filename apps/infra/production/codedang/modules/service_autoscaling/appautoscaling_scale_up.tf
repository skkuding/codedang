resource "aws_cloudwatch_metric_alarm" "scale_up" {
  alarm_name        = var.scale_up.cloudwatch_metric_alarm.alarm_name
  alarm_description = var.scale_up.cloudwatch_metric_alarm.alarm_description
  alarm_actions     = [aws_appautoscaling_policy.scale_up.arn]

  comparison_operator = "GreaterThanThreshold"
  datapoints_to_alarm = 1
  evaluation_periods  = 1
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 60
  statistic           = var.scale_up.cloudwatch_metric_alarm.statistic
  threshold           = var.scale_up.cloudwatch_metric_alarm.threshold

  dimensions = {
    ClusterName = var.scale_up.cloudwatch_metric_alarm.dimensions.cluster_name
    ServiceName = aws_ecs_service.this.name
  }
}

resource "aws_appautoscaling_policy" "scale_up" {
  name               = "scale-up"
  policy_type        = "StepScaling"
  resource_id        = aws_appautoscaling_target.this.resource_id
  scalable_dimension = aws_appautoscaling_target.this.scalable_dimension
  service_namespace  = aws_appautoscaling_target.this.service_namespace

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
