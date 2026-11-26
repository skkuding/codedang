# Grafana Operator

The operator manages Grafana service accounts and dashboards as code. It does not deploy
Grafana: the Helm release in `../grafana` still owns the Grafana Deployment,
and the `Grafana` resource here points at it through `spec.external`,
signing in with the existing `grafana-admin-user` Secret.

The operator is namespace-scoped. It watches only `monitoring-grafana` and
holds a Role there, with no cluster-wide access.

To add a service account, add a `GrafanaServiceAccount` to
`service-accounts.yaml`. The operator creates the account and writes each
token to a Secret under the `token` key, so token values never appear in this
repository. Removing the resource asks Grafana to delete the account, but if
that request fails the operator only logs the error, so check in Grafana that
the account is gone.

| Account    | Role   | Token Secret             | Used by         |
| ---------- | ------ | ------------------------ | --------------- |
| `ai-agent` | Viewer | `grafana-ai-agent-token` | Discord agent   |

## Dashboards

Dashboards shared by stage and production live in `dashboards/` as JSON.
`kustomization.yaml` packs them into the `operator-dashboards` ConfigMap, and
each `GrafanaDashboard` in `dashboards.yaml` points at one key. The `Grafana`
resource carries the `dashboards: grafana` label that `instanceSelector`
matches. Change a dashboard here, not in the Grafana UI: the JSON in this
repository is the source.

| Dashboard                  | File                                 |
| -------------------------- | ------------------------------------ |
| API 엔드포인트 응답시간     | `dashboards/endpoint-latency.json`   |

## Discord agent token

The Discord agent runs in the stage cluster and needs both the stage and the
production token, so `ai-agent` exists in both Grafana instances.

Copy each token by hand from `grafana-ai-agent-token` into the agent's own
Secret. The operator revokes the token and issues a new one when
`grafana-ai-agent-token` in `monitoring-grafana` is deleted or the token
settings change. Deleting the agent's copy does not revoke anything. After a
reissue the copied value stops working without any error, so copy the new
value again.

Grafana OSS has no per-datasource permissions, so this Viewer token can query
every datasource: production Loki logs, which include emails and student IDs,
CloudWatch, and the stage database view. The agent, not Grafana, decides what
reaches Discord.
