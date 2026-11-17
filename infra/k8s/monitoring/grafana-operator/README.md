# Grafana Operator

The operator manages Grafana service accounts as code. It does not deploy
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
