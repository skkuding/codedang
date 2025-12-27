# Onboarding Kubernetes Deployment Guide

This document provides step-by-step instructions for deploying a sample application to the "onboarding" namespace in your Kubernetes cluster as part of the onboarding process.
Unlike previous study, this task is focused on practical deployment using GitHub, Kubernetes, Grafana and ArgoCD.
By completing this task, you will gain hands-on experience with Kubernetes deployments, service management, monitoring with Grafana, and using ArgoCD for continuous deployment.

## Instructions

### Prerequisites

1. Clone the repository, checkout the onboarding branch, and pull the latest changes.

    ```bash
    # skip if you have already cloned the repository
    git clone https://github.com/skkuding/codedang
    git checkout onboarding
    git pull origin onboarding
    ```

1. Read the commit convention guidelines in `CONTRIBUTING.md`.

1. Create a branch according to the naming convention.

    ```bash
    git checkout -b <your-branch-name>
    ```

### Kubernetes Deployment

1. Using the previous docker image you built from study, create a Kubernetes deployment for the application in `infra/k8s/onboarding/<application-name>/` directory.

    - use other kind of resource if needed
    - you may use <https://hub.docker.com/r/okteto/example-react> if you don't have your own image
    - Advanced: use kustomize to manage different environments or configurations.

    <details>
      <summary>Hint: Example directory structure</summary>

      ```
      infra/
      └── k8s/
          └── onboarding/
              └── <application-name>/
                  ├── deployment.yaml
                  ├── service.yaml
                  └── ingress.yaml
      ```

    </details>

1. Connect to SKKU VPN.

1. Ensure that your `kubectl` is configured to use the correct context(stage) for the onboarding namespace.

    ```bash
    kubectl config get-contexts
    kubectl config use-context <your-cluster-context>
    ```

1. Deploy the application to the **onboarding** namespace in your Kubernetes cluster using `kubectl apply`.
**Warning**: Ensure that you are using the correct **context(stage)** and **namespace** to avoid deploying to the wrong cluster.

1. Using kubernetes dashboard or `kubectl describe/logs`, verify that the deployment is running correctly.

1. Commit your changes

    ```bash
    git add .
    git commit -m "<conventional-commit-message>"
    ```

1. Get a screenshot of the running application in Grafana(<https://grafana.stage.codedang.com>) including the application metrics and logs.

### AWS Route 53 with Terraform

1. Initialize DNS directory if you haven't already.

    ```bash
    cd infra/aws/dns
    terraform init
    ```

1. Create a DNS record for your application in `infra/aws/dns/_onboarding.tf` file with the following format: `<application-name>.first-task.codedang.com`.

1. Plan and veryify the changes.

    ```bash
    terraform plan
    ```

1. Apply the changes to create the DNS record.

    ```bash
    terraform apply
    ```

    **Warning**: Ensure that you are working in the correct directory to avoid unintended changes.
   **DANGER: AVOID CHANGES TO EXISTING RESOURCES ESPECIALLY RELATED TO RDS**
    Hint: Consider communicating with your team if you meet any issues related to lock files or state files.

1. Ensure that the application is accessible via the created DNS record using a web browser or `curl`.

    ```bash
    curl http://<application-name>.first-task.codedang.com
    ```

### ArgoCD Deployment

1. Locate the example ArgoCD application manifest in `infra/k8s/argocd/applications/onboarding/example`.

1. Copy the manifest to a new file named `<application-name>.yaml` in the same directory.

1. Update the manifest to point to your application's Kubernetes manifests in the repository.

### GitHub Pull Request

1. Push your branch to the remote repository.

    ```bash
    git push origin <your-branch-name>
    ```

1. Check the `CONTRIBUTING.md` for pull request guidelines.

1. Go to the [GitHub repository](https://github.com/skkuding/codedang) and create a pull request from your branch to the **onboarding** branch in the repository.

1. Request a review from your peers or maintainers.

1. Once approved, merge the pull request to deploy the application to the cluster.

### Verification

Double check that the application is successfully deployed

1. with ArgoCD(<https://argocd.codedang.com>)

1. with browser(`https://<application-name>.first-task.codedang.com`)

1. with Grafana(<https://stage.grafana.codedang.com>)

1. with Kubernetes Dashboard(<https://k8s.stage.codedang.com>).

## Cleanup

After successful deployment, delete the application and code from the cluster to clean up resources.

1. Create a branch for cleanup(e.g., `t1234-cleanup-example-app`).

2. Remove all code related to the deployed application from the repository.

3. Commit and push the changes to the branch.

4. Make a pull request for the cleanup branch and request a review.

5. Once approved, merge the pull request to remove the application from the cluster.

6. Verify that all resources related to the application have been deleted from the Kubernetes cluster.

## Further Steps

After completing the onboarding deployment, consider exploring advanced topics such as:

1. Use [kubeseal](https://docs.codedang.com/dev/infra/k8s/secrets.html) to manage secrets securely within your Kubernetes cluster.

1. Deploy open source applications like [RabbitMQ](https://artifacthub.io/packages/helm/cloudpirates-rabbitmq/rabbitmq) or [Redis](https://artifacthub.io/packages/helm/cloudpirates-redis/redis) using [Helm charts](https://helm.sh/).

1. Connect other services or databases to your deployed applications for more complex scenarios with FQDN(Fully Qualified Domain Name).

1. Explore AWS services like RDS, S3, Route53, ECS and IAM to enhance your application deployments.

1. Set up persistent storage for your applications using Persistent Volumes (PVs) and Persistent Volume Claims (PVCs) for stateful workloads like databases.

1. Implement [OTel SDK](https://www.npmjs.com/package/@opentelemetry/core) to your source code for enhanced observability and monitoring.
