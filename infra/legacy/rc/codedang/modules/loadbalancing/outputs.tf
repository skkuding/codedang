output "target_group_arn" {
  value = aws_lb_target_group.this.arn
}

output "aws_lb_dns_name" {
  value = aws_lb.this.dns_name
}

output "aws_lb_id" {
  value = aws_lb.this.id
}
