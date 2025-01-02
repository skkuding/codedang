variable "subnets" {
  type = map(object({
    vpc_id            = string
    cidr_block        = string
    availability_zone = string
    tags_name         = string
    route_table_id    = string
  }))
  description = "The map of subnets. e.g. {codedang_subnet={cidr_block='10.0.1.0/24', availability_zone='ap-northeast-2a', tags_name='codedang-sub', subnet_type='private'}}"
}
