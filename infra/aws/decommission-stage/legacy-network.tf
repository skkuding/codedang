# These three private DB subnets predate the active public RDS subnet group.
resource "aws_subnet" "legacy_db_1" {
  vpc_id            = local.vpc_id
  cidr_block        = "10.0.11.0/24"
  availability_zone = "ap-northeast-2a"

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

resource "aws_subnet" "legacy_db_2" {
  vpc_id            = local.vpc_id
  cidr_block        = "10.0.12.0/24"
  availability_zone = "ap-northeast-2b"

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

resource "aws_subnet" "legacy_db_3" {
  vpc_id            = local.vpc_id
  cidr_block        = "10.0.13.0/24"
  availability_zone = "ap-northeast-2c"

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}
