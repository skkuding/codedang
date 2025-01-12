resource "aws_cloudwatch_metric_alarm" "scale_down" {
  alarm_name        = var.scale_down.cloudwatch_metric_alarm.alarm_name
  alarm_description = var.scale_down.cloudwatch_metric_alarm.alarm_description
  alarm_actions     = [aws_appautoscaling_policy.scale_down.arn]

  comparison_operator = "LessThanThreshold"
  datapoints_to_alarm = var.scale_down.cloudwatch_metric_alarm.datapoints_to_alarm
  evaluation_periods  = var.scale_down.cloudwatch_metric_alarm.evaluation_periods
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 60
  statistic           = "Average"
  threshold           = var.scale_down.cloudwatch_metric_alarm.threshold

  dimensions = {
    ClusterName = var.scale_down.cloudwatch_metric_alarm.dimensions.cluster_name
    ServiceName = aws_ecs_service.this.name
  }
}

resource "aws_appautoscaling_policy" "scale_down" {
  name               = "scale-down"
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
      metric_interval_upper_bound = -30
      scaling_adjustment          = -1
    }
  }
}
