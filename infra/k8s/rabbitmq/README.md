## How to setup RabbitMQ

1. Install RabbitMQ operator

Prerequisites: cert-manager installed

```sh
# RabbitMQ Cluster Operator
kubectl apply -f "https://github.com/rabbitmq/cluster-operator/releases/latest/download/cluster-operator.yml"

# RabbitMQ Messaging Topology Operator
kubectl apply -f "https://github.com/rabbitmq/messaging-topology-operator/releases/latest/download/messaging-topology-operator-with-certmanager.yaml"
```
