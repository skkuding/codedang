# PostgreSQL pool telemetry (Prisma 7)

Both APIs observe the same `pg.Pool` passed to PrismaPg through the global
OpenTelemetry MeterProvider. The existing reader exports every 15 seconds to
the OTel Collector; Prometheus scrapes the Collector on port 8889. The retired
`/api/internal/prisma` endpoint and API ServiceMonitors are no longer used.

| OTel instrument | Unit | Attributes | Expected Prometheus name |
| --- | --- | --- | --- |
| `codedang.pg.pool.connections` | `{connection}` | `pool=primary`, `state=used` or `idle` | `codedang_pg_pool_connections` |
| `codedang.pg.pool.pending_requests` | `{request}` | `pool=primary` | `codedang_pg_pool_pending_requests` |
| `codedang.pg.pool.connection_limit` | `{connection}` | `pool=primary` | `codedang_pg_pool_connection_limit` |

Confirm translated names on the Collector's `/metrics` before updating external
Grafana dashboards or alerts; no Prisma dashboard or alert definitions are
stored here. Resource attributes are copied to metric labels by the Collector.
Keep `service_name` (`admin-api`/`client-api`) and `service_instance_id` when
aggregating so replicas do not overwrite one another. Never label by user, SQL,
parameters, connection ID, or transaction ID.

`used = totalCount - idleCount` includes connections held by transactions.
`pending_requests` measures queue size, not wait duration. These gauges replace
`prisma_pool_connections_busy`, `prisma_pool_connections_idle`, and pool queue
snapshots. Current connection count is not a cumulative creation counter.
Removed Prisma query counters, duration histograms, and wait-duration metrics
have no exact replacement here. PrismaInstrumentation remains enabled for
tracing; sampled spans must not be used as exact query counts. Add application
counters/histograms only if a concrete query SLO requires them.

In Grafana Explore, verify separate admin/client and instance series while idle,
executing queries, holding transactions, and saturating a small test pool. Check
that used+idle never exceeds the configured limit, pending rises under load,
connections recover after load, and all callbacks/connections stop at shutdown.
Snapshots can miss saturation shorter than the 15-second collection interval.
Verify request-to-database spans independently and check for duplicate exports.

## Connection budget and rollout gates

Production currently has 1 admin replica and 3 client replicas, each limited to
25 connections: 100 steady-state API connections. Admin maxSurge=1 and the
client default 25% surge (rounded up to 1) allow 150 API connections during a
simultaneous rollout. Include terminating Pods until their connections close,
HPA/manual scaling, migrations, seeds, maintenance scripts, Iris, Plag, and
operator sessions before comparing the budget with PostgreSQL max_connections
minus its reserved connections. The base/stage API limit of 225 permits 900
steady-state and 1350 surge API connections with those replica counts; verify
stage overrides and database capacity before rollout. Do not treat these API
subtotals as a validated database-wide budget.

Runtime policy: max defaults to 10 if unset, acquisition/connect timeout is 5s,
and idle connections expire after 300s. Pool settings belong in runtime code,
not Prisma CLI config. Before deploying, validate the RDS URL and CA chain with
the new driver (including sslmode=require behavior); do not disable certificate
verification to work around trust failures. RDS connectivity, live Collector /
Prometheus series, external dashboards/alerts, and comparable before/after
latency, memory, connections, and tracing overhead remain rollout acceptance
checks.
