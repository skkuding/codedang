# What is Github Actions Runner Scale Set Controller?

GitHub Actions Runner is a service that allows you to run workflows in response to GitHub events. The Runner Scale Set Controller is a Kubernetes controller that manages the lifecycle of GitHub Actions Runners in a Kubernetes cluster, allowing for dynamic scaling based on workload demands.

## Why do we need this?

As GitHub Runner is too slow, we need to optimize the workflow execution time by using local cluster resources.

## TODO

- [ ] Replace the cache registry with kubernetes local one in order to reduce network latency.
