# Prisma metrics retirement

The legacy Prisma Client metrics HTTP API has been retired before upgrading
to Prisma ORM 7. The admin and client APIs
no longer expose `/api/internal/prisma`, and their API ServiceMonitors have
been removed. Remove dashboard queries and alerts that depend on the retired
`prisma_*` metrics, or update them when replacement pool telemetry is enabled.

PrismaInstrumentation remains enabled for tracing. Sampled spans are not exact
query counters or replacements for pool metrics.
