removed {
  from = aws_route53_record.codedang

  lifecycle {
    destroy = false
  }
}
