/* TAS-2763: Legacy ALB output sources are commented with the resources.
output "security_group_id" {
  value = aws_security_group.this.id
}

output "target_group_arn" {
  value = aws_lb_target_group.this.arn
}
*/

output "security_group_id" {
  value = "sg-disabled"
}

output "target_group_arn" {
  value = "arn:aws:elasticloadbalancing:ap-northeast-2:219857217698:targetgroup/disabled/0000000000000000"
}
