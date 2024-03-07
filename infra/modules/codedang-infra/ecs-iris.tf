###################### Subnet ######################
resource "aws_subnet" "private_iris1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.41.0/24"
  availability_zone = var.availability_zones[0]

  tags = {
    Name = "Codedang-Iris-Subnet1"
  }
}

resource "aws_subnet" "private_iris2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.42.0/24"
  availability_zone = var.availability_zones[2]

  tags = {
    Name = "Codedang-Iris-Subnet2"
  }
}

###################### ECS Service ######################
resource "aws_ecs_service" "iris" {
  name            = "Codedang-Iris-Service"
  cluster         = aws_ecs_cluster.iris.id
  task_definition = aws_ecs_task_definition.iris.arn
  desired_count   = 2
  launch_type     = "EC2"
}

data "aws_ecr_repository" "iris" {
  name = "codedang-iris"
}


###################### ECS Task Definition ######################
resource "aws_ecs_task_definition" "iris" {
  family                   = "Codedang-Iris-Api"
  requires_compatibilities = ["EC2"]
  network_mode             = "bridge"
  container_definitions = templatefile("${path.module}/iris/task-definition.tftpl", {
    ecr_uri              = data.aws_ecr_repository.iris.repository_url,
    testcase_bucket_name = aws_s3_bucket.testcase.id,
    rabbitmq_host        = "${aws_mq_broker.judge_queue.id}.mq.${var.region}.amazonaws.com",
    rabbitmq_port        = var.rabbitmq_port,
    rabbitmq_username    = var.rabbitmq_username,
    rabbitmq_password    = random_password.rabbitmq_password.result,
    rabbitmq_vhost       = rabbitmq_vhost.vh.name,
    cloudwatch_region    = var.region,
    redis_host           = aws_elasticache_cluster.db_cache.cache_nodes.0.address,
    redis_port           = var.redis_port,
    otel_endpoint        = "${var.otel_url}:${var.otel_port}",
  })
  execution_role_arn = aws_iam_role.ecs_iris_task_execution_role.arn
  task_role_arn      = aws_iam_role.ecs_iris_task_role.arn
}
