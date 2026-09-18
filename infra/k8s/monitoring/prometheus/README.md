# Prisma Client metrics

Admin and client API Pods expose Prisma metrics at `GET /api/internal/prisma`.
Each API Service has a `ServiceMonitor` labeled `release: prometheus` that selects
its `app` label and scrapes the named `http` port every 30 seconds.

Prometheus reaches Pod endpoints through the ClusterIP Service, not the public
ingress. The existing Grafana datasource (`prometheus`) can query these metrics;
no new datasource or dashboard is required.

Apply the internal-route protection and backend endpoint before these
ServiceMonitors. After rollout, confirm the Prometheus targets are `UP` and query
`prisma_pool_connections_busy` in Grafana Explore.
