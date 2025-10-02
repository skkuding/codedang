variable "key_names" {
  type        = list(string)
  description = "The name of keys e.g. ['bastion-host', 'codedang-ecs-api-instance']"
}

variable "bucket_name" {
  type        = string
  description = "The name of key_pair bucket e.g. 'codedang-key-pair-rc"
}

variable "env" { sensitive = true }
