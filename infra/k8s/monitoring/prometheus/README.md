# What is Prometheus?

Prometheus is an open-source monitoring and alerting toolkit to collect and store **metrics**.

# What is kube-prometheus-stack?
kube-prometheus-stack is a collection of Kubernetes manifests, Grafana dashboards, and Prometheus rules combined into a single package to provide a complete monitoring solution for Kubernetes clusters.

It contains the following components:
- Prometheus: for collecting and storing metrics
- Grafana: for visualizing metrics
- Node Exporter: for collecting hardware and OS metrics
- Kube-state-metrics: for collecting Kubernetes object metrics

# Why use kube-prometheus-stack?

kube-prometheus-stack automatically deploys and configures all the components needed for a complete monitoring solution for Kubernetes clusters.
With DaemonSets, it ensures that the Node Exporter is running on every node in the cluster, providing comprehensive hardware and OS metrics.

# Why is Grafana disabled?

We use kube-prometheus-stack because it provides a complete monitoring solution for Kubernetes clusters.
However, in order to separate concerns and manage resources more effectively, we can deploy Grafana as a standalone application.
Grafana is not only for prometheus but also for other data sources, including Loki for logs and Tempo for traces.

# How kube-prometheus-stack and OTel Collector are connected?: ServiceMonitor

kube-prometheus-stack discovers targets by looking for a CRD(Custom Resource Definition), ServiceMonitors in the cluster.
ServiceMonitors inside the kubernetes cluster are deployed by helm chart of kube-prometheus-stack.
However in case of OTel Collector, which we defined through the OpenTelemetryCollector CRD, we need to create a ServiceMonitor manually to enable scraping because it is not automatically discovered by kube-prometheus-stack.


# Prisma Client metrics

Admin and stage/production client expose `GET /api/internal/prisma` on their existing
API ports. Development client uses `GET /internal/prisma`, following its existing
route convention without a global API prefix. The endpoint exports the application's existing Prisma Client metrics
in Prometheus text format without JWT authentication. The current lockfile resolves
Prisma and Prisma Client to 6.13.0; no database migration is needed.

Each API base includes a `ServiceMonitor` labeled `release: prometheus`, matching
the existing kube-prometheus-stack Helm release. Prometheus discovers the service
endpoints and scrapes every API Pod through the named `http` service port every 30s.
The public ingress and the OTel Collector are not involved in this scrape path.
Existing OTel metrics continue to be collected separately.

Grafana's existing datasource UID `prometheus` can query these metrics directly.
No new datasource or dashboard provisioning is required.

## Public access and rollout

The shared internal infrastructure overlay registers an `internal-deny` Gateway API
`HTTPRoute` on every HTTP/HTTPS listener of `main-gateway`, without restricting
hostnames. It blocks `/api/internal` and every `/api/internal/` descendant without
forwarding to application services: the rule has no backend references or filters.
Gateway API specifies a 500 response for this rule; Traefik's empty weighted service
returns 503. Verify a blocking 5xx response rather than the former 418.

A `PathPrefix` match covers the lowercase path, and a `RegularExpression` match
`(?i)^/api/internal(/|$)` also blocks case variants such as `/api/INTERNAL/prisma`.
`/api/internal-example` does not match. Regular-expression support and precedence
are implementation-specific in Gateway API; verify both when changing proxies.
The HTTPS listeners allow routes from `kube-system` so the deny route can attach.
Cluster-internal requests go directly to the API ClusterIP services and bypass
these public routes.

Apply/sync the internal infrastructure first and verify external blocking before
rolling out API images. Apply ServiceMonitors after the API endpoints are available. Stage tracks `main`; production tracks
`release`. The API and internal infrastructure ArgoCD applications sync independently,
so verify this ordering explicitly during rollout.

## Deployment checks

Run these checks against the appropriate stage or production cluster after rollout:

- Confirm the `internal-deny` HTTPRoute exists in `kube-system` and reports
  `Accepted=True` and `ResolvedRefs=True` for every `main-gateway` listener.
- External HTTPS requests to `/api/internal`, `/api/internal/prisma`, and `/api/internal/test`
  and case variants such as `/api/INTERNAL/prisma` must return a blocking 5xx
  (503 on Traefik). HTTP must also block these requests without forwarding to an API.
  Existing `/api/`, `/graphql`, and frontend routes must continue to work.
- From a cluster-internal HTTP client, check these endpoints without Authorization:
  `http://admin-api-server.admin-api.svc.cluster.local:3000/api/internal/prisma` and
  `http://client-api-server.client-api.svc.cluster.local:4000/api/internal/prisma`.
  Both must return 200, a Prometheus text Content-Type, and `prisma_` metrics.
- Check both ServiceMonitors and Prometheus Targets. Each running API Pod must have
  an UP scrape target. Metrics are per process, so do not scrape a load-balanced
  public URL in place of endpoint discovery.
- In Grafana Explore, select datasource `prometheus` and query
  `prisma_pool_connections_busy`. Results must include the expected namespace and
  Pod labels for admin and client.

## Local validation

Run `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s infra/k8s/internal/tests -v`
from the repository root to check case variants and internal-path boundaries.

From the repository root, render the `admin-api`, `client-api`, and `internal`
Kustomize overlays for both environments with `kubectl kustomize`. Render
kube-prometheus-stack chart 79.5.0 with release name `prometheus`, namespace
`monitoring-prometheus`, and the respective `values-stage.yaml` or
`values-production.yaml`. Confirm `serviceMonitorSelector.matchLabels.release`
is `prometheus` and `serviceMonitorNamespaceSelector` is `{}`.

From `apps/backend`, after dependency installation and `prisma generate`, run the
isolated HTTP tests without the database-resetting pretest script:

```sh
pnpm exec mocha --no-config --require @swc-node/register --require tsconfig-paths/register libs/internal/src/internal.controller.spec.ts
```
