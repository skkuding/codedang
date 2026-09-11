# Detach retired resources from this state before importing them into
# terraform/decommission-stage.tfstate.
removed {
  from = aws_instance.nat_instance

  lifecycle {
    destroy = false
  }
}

removed {
  from = aws_instance.bastion_host

  lifecycle {
    destroy = false
  }
}

removed {
  from = module.private_api_subnets

  lifecycle {
    destroy = false
  }
}

removed {
  from = module.private_iris_subnets

  lifecycle {
    destroy = false
  }
}

removed {
  from = module.private_admin_api_subnets

  lifecycle {
    destroy = false
  }
}

removed {
  from = module.private_redis_subnets

  lifecycle {
    destroy = false
  }
}

removed {
  from = module.private_mq_subnets

  lifecycle {
    destroy = false
  }
}

removed {
  from = module.public_api_subnets

  lifecycle {
    destroy = false
  }
}

removed {
  from = module.storage_security_groups

  lifecycle {
    destroy = false
  }
}

removed {
  from = module.lb_security_groups

  lifecycle {
    destroy = false
  }
}

removed {
  from = module.ssh_security_groups

  lifecycle {
    destroy = false
  }
}

removed {
  from = module.app_security_groups

  lifecycle {
    destroy = false
  }
}

removed {
  from = module.nat_security_groups

  lifecycle {
    destroy = false
  }
}
