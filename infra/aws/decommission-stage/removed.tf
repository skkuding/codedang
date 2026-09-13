# The private route table retains this inline route. Detach the duplicate
# standalone representation without deleting the route from AWS.
removed {
  from = aws_route.nat_default

  lifecycle {
    destroy = false
  }
}

# Preserve the ACTIVE task definitions while moving their Terraform ownership
# to the disabled legacy state.
removed {
  from = aws_ecs_task_definition.legacy

  lifecycle {
    destroy = false
  }
}
