# Postgres in kubernetes

This deployment is intended only for stage environment.

It is ideal to use AWS RDS in stage environment, to mock as close as possible the production environment.
However, we've decided to use on-premise Postgres in stage environment to save costs.
Strongly recommend to use AWS RDS in production environment for better reliability and scalability.

## PostgreSQL 18 migration

`postgres-v18` is the active stage database. It uses a retained Longhorn volume,
while the PostgreSQL 16 `postgres` Deployment and `postgres-pvc` remain declared
for rollback during the retention period.

The stable `postgres-svc` selects `postgres-v18`. `postgres-v18-svc` is an
isolated endpoint for restore validation and diagnostics. Rollback requires
stopping all database writers, scaling `postgres` to one replica, changing
`postgres-svc` back to `app: postgres`, and restarting consumers after the old
database is Ready. Do not delete either PVC during migration or rollback.
