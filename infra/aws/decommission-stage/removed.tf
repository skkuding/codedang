# The private route table retains this inline route. Detach the duplicate
# standalone representation without deleting the route from AWS.
removed {
  from = aws_route.nat_default

  lifecycle {
    destroy = false
  }
}
