# Onboarding Kubernetes Deployment Guide

This document provides step-by-step instructions for deploying a sample application to the "onboarding" namespace in your Kubernetes cluster as part of the onboarding process.
Unlike previous study, this task is focused on practical deployment using GitHub, Kubernetes, Grafana and ArgoCD.
By completing this task, you will gain hands-on experience with Kubernetes deployments, service management, monitoring with Grafana, and using ArgoCD for continuous deployment.

## Instructions

1. Create a branch according to the naming convention(e.g., `t1234-deploy-example-app`)

2. Using the previous docker image you built from study, create a Kubernetes deployment for the application(use other kind of resource if needed).

3. Deploy the application to the "onboarding" namespace in your Kubernetes cluster using `kubectl`.
**Warning**: Ensure that you are using the correct **context(stage)** and **namespace** to avoid deploying to the wrong cluster.

4. Using kubernetes dashboard or `kubectl describe/logs`, verify that the deployment is running correctly.

5. Get a screenshot of the running application in Grafana(`https://grafana.codedang.com`) including the application metrics and logs.

6. Ensure that the application is accessible via a DNS record in your AWS Route 53(e.g., `<application-name>.first-task.codedang.com`).

7. Use ArgoCD to manage the deployment of this application to your Kubernetes cluster.

8. Make a pull request with all the necessary files and configurations for the deployment, along with the screenshot from Grafana and request a review.

9. Once approved, merge the pull request to deploy the application to the cluster.

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

1. Deploy open source applications like RabbitMQ or Redis using Helm charts.

2. Set up persistent storage for your applications using Persistent Volumes (PVs) and Persistent Volume Claims (PVCs).

3. Implement OTel SDK to your source code for enhanced observability and monitoring.

4. Connect other services or databases to your deployed applications for more complex scenarios.

5. Use kubeseal to manage secrets securely within your Kubernetes cluster.

6. Explore AWS services like RDS, S3, Route53, ECS and IAM to enhance your application deployments.
