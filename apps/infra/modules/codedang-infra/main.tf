terraform {
  required_providers {
    rabbitmq = {
      source  = "cyrilgdn/rabbitmq"
      version = "1.8.0"
    }
    random = {
      source = "hashicorp/random"
      version = "3.6.1"
    }
  }
}
