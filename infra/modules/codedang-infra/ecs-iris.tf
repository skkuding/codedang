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
    ecr_uri             = data.aws_ecr_repository.iris.repository_url,
    rabbitmq_host       = "${aws_mq_broker.judge_queue.id}.mq.${var.region}.amazonaws.com",
    rabbitmq_port       = var.rabbitmq_port,
    rabbitmq_username   = var.rabbitmq_username,
    rabbitmq_password   = random_password.rabbitmq_password.result,
    rabbitmq_vhost      = rabbitmq_vhost.vh.name,
    cloudwatch_region   = var.region,
    testcase_server_url = aws_s3_bucket.testcase.bucket_domain_name,
  })
  execution_role_arn = aws_iam_role.ecs_iris_task_execution_role.arn
}
