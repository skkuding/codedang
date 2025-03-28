variable "key_names" {
  type        = list(string)
  description = "The name of keys e.g. ['skku-network-proxy']"
}

variable "bucket_name" {
  type        = string
  description = "The name of key_pair bucket e.g. 'skku-network-proxy-key-pair'"
}

variable "env" { sensitive = true }
