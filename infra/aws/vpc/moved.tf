# Keep active DB resources in this state while the retired instances from the
# former mixed-purpose modules are detached by removed.tf.
moved {
  from = module.public_api_subnets.aws_subnet.this["public_db1"]
  to   = module.public_db_subnets.aws_subnet.this["public_db1"]
}

moved {
  from = module.public_api_subnets.aws_subnet.this["public_db2"]
  to   = module.public_db_subnets.aws_subnet.this["public_db2"]
}

moved {
  from = module.public_api_subnets.aws_subnet.this["public_db3"]
  to   = module.public_db_subnets.aws_subnet.this["public_db3"]
}

moved {
  from = module.public_api_subnets.aws_route_table_association.this["public_db1"]
  to   = module.public_db_subnets.aws_route_table_association.this["public_db1"]
}

moved {
  from = module.public_api_subnets.aws_route_table_association.this["public_db2"]
  to   = module.public_db_subnets.aws_route_table_association.this["public_db2"]
}

moved {
  from = module.public_api_subnets.aws_route_table_association.this["public_db3"]
  to   = module.public_db_subnets.aws_route_table_association.this["public_db3"]
}

moved {
  from = module.storage_security_groups.aws_security_group.this["sg_db"]
  to   = module.database_security_groups.aws_security_group.this["sg_db"]
}
