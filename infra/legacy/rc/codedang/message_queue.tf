# provider.rabbitmq가 있어야 생성할 수 있는 자원들
# mq_broker는 storage 프로젝트를 참조

resource "rabbitmq_vhost" "vh" {
  name = "vh"
}

resource "rabbitmq_permissions" "vh_perm" {
  user  = var.rabbitmq_username
  vhost = rabbitmq_vhost.vh.name

  permissions {
    configure = ".*"
    write     = ".*"
    read      = ".*"
  }
}

resource "rabbitmq_exchange" "exchange" {
  name  = "iris.e.direct.judge"
  vhost = rabbitmq_permissions.vh_perm.vhost

  settings {
    type    = "direct"
    durable = true
  }
}

resource "rabbitmq_queue" "result_queue" {
  name  = "iris.q.judge.result"
  vhost = rabbitmq_permissions.vh_perm.vhost

  settings {
    durable = true
  }
}

resource "rabbitmq_queue" "submission_queue" {
  name  = "client.q.judge.submission"
  vhost = rabbitmq_permissions.vh_perm.vhost

  settings {
    durable        = true
    arguments_json = var.rabbitmq_arguments
  }
}

resource "rabbitmq_binding" "result_binding" {
  source           = rabbitmq_exchange.exchange.name
  vhost            = rabbitmq_vhost.vh.name
  destination      = rabbitmq_queue.result_queue.name
  destination_type = "queue"
  routing_key      = "judge.result"
}

resource "rabbitmq_binding" "submission_binding" {
  source           = rabbitmq_exchange.exchange.name
  vhost            = rabbitmq_vhost.vh.name
  destination      = rabbitmq_queue.submission_queue.name
  destination_type = "queue"
  routing_key      = "judge.submission"
}
