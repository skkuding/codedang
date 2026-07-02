removed {
  from = archive_file.lambda_zip

  lifecycle {
    destroy = false
  }
}

removed {
  from = aws_cloudwatch_event_rule.every_30_days

  lifecycle {
    destroy = false
  }
}

removed {
  from = aws_cloudwatch_event_target.lambda

  lifecycle {
    destroy = false
  }
}

removed {
  from = aws_iam_role.lambda_exec

  lifecycle {
    destroy = false
  }
}

removed {
  from = aws_iam_role_policy.lambda_secretsmanager

  lifecycle {
    destroy = false
  }
}

removed {
  from = aws_lambda_function.update_instagram_token

  lifecycle {
    destroy = false
  }
}

removed {
  from = aws_lambda_permission.allow_cloudwatch

  lifecycle {
    destroy = false
  }
}

removed {
  from = aws_secretsmanager_secret.instagram_token

  lifecycle {
    destroy = false
  }
}

removed {
  from = aws_secretsmanager_secret_version.instagram_token

  lifecycle {
    destroy = false
  }
}

removed {
  from = aws_secretsmanager_secret.judge_queue

  lifecycle {
    destroy = false
  }
}

removed {
  from = aws_secretsmanager_secret_version.judge_queue

  lifecycle {
    destroy = false
  }
}

removed {
  from = rabbitmq_binding.result_binding

  lifecycle {
    destroy = false
  }
}

removed {
  from = rabbitmq_binding.submission_binding

  lifecycle {
    destroy = false
  }
}

removed {
  from = rabbitmq_exchange.exchange

  lifecycle {
    destroy = false
  }
}

removed {
  from = rabbitmq_permissions.vh_perm

  lifecycle {
    destroy = false
  }
}

removed {
  from = rabbitmq_queue.result_queue

  lifecycle {
    destroy = false
  }
}

removed {
  from = rabbitmq_queue.submission_queue

  lifecycle {
    destroy = false
  }
}

removed {
  from = rabbitmq_vhost.vh

  lifecycle {
    destroy = false
  }
}
