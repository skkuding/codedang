resource "aws_iam_user" "grafana_cloudwatch" {
  name = "on-prem-grafana-cloudwatch"
  tags = {
    Description = "Grafana CloudWatch datasource on on-premise k8s cluster"
  }
}

resource "aws_iam_access_key" "grafana_cloudwatch" {
  user = aws_iam_user.grafana_cloudwatch.name
}

data "aws_iam_policy_document" "grafana_cloudwatch" {
  # CloudWatch read access (Grafana CloudWatch plugin minimum permissions)
  statement {
    actions = [
      "cloudwatch:DescribeAlarmsForMetric",
      "cloudwatch:DescribeAlarmHistory",
      "cloudwatch:DescribeAlarms",
      "cloudwatch:ListMetrics",
      "cloudwatch:GetMetricData",
      "cloudwatch:GetInsightRuleReport",
    ]
    resources = ["*"]
  }

  # CloudWatch Logs (for log queries in Grafana)
  statement {
    actions = [
      "logs:DescribeLogGroups",
      "logs:GetLogGroupFields",
      "logs:StartQuery",
      "logs:StopQuery",
      "logs:GetQueryResults",
      "logs:GetLogEvents",
    ]
    resources = ["*"]
  }

  # EC2 describe (for cross-account and region discovery)
  statement {
    actions = [
      "ec2:DescribeTags",
      "ec2:DescribeInstances",
      "ec2:DescribeRegions",
    ]
    resources = ["*"]
  }

  # Resource Groups Tagging (for resource discovery)
  statement {
    actions   = ["tag:GetResources"]
    resources = ["*"]
  }
}

resource "aws_iam_user_policy" "grafana_cloudwatch" {
  name   = "codedang-grafana-cloudwatch"
  user   = aws_iam_user.grafana_cloudwatch.name
  policy = data.aws_iam_policy_document.grafana_cloudwatch.json
}

output "grafana_cloudwatch_access_key_id" {
  value = aws_iam_access_key.grafana_cloudwatch.id
}

output "grafana_cloudwatch_secret_access_key" {
  value     = aws_iam_access_key.grafana_cloudwatch.secret
  sensitive = true
}
