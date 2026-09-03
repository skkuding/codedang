# Stage Application MinIO to Silo Migration

Task: TAS-2881

This runbook implements the application phase of the stage migration. The
monitoring tenant remains on MinIO until the Longhorn capacity and failover
gates pass.

## Safety Invariants

- Run every Kubernetes command with `--context stage` and an explicit
  namespace.
- Keep source MinIO authoritative until the final comparison passes.
- Never mount the source PVC into Silo.
- Never run forward and reverse mirrors concurrently.
- Stop the mirror before allowing normal writes to Silo.
- Keep the source Tenant and PVC intact through the rollback deadline.
- Make durable workload, mirror, and routing changes through reviewed GitOps
  commits. Do not rely on manual scaling while Argo CD self-heal is enabled.

## Phase 1: Deploy The Isolated Target

The initial manifests deliberately keep `silo-mirror` at zero replicas and
leave `minio-ingress` routed to source MinIO.

After the change reaches `main`, verify from the central Argo CD cluster:

```bash
kubectl --context prod get application minio-stage -n argocd
```

Verify the isolated target in stage:

```bash
kubectl --context stage get statefulset,pod,service,pvc -n minio
kubectl --context stage get pv
kubectl --context stage rollout status statefulset/silo-shadow -n minio --timeout=5m
kubectl --context stage port-forward -n minio service/silo-shadow 9000:80 9001:9090
```

With the port-forward active, require HTTP 200 from both health endpoints:

```bash
curl --fail --silent --show-error http://127.0.0.1:9000/minio/health/live
curl --fail --silent --show-error http://127.0.0.1:9000/minio/health/ready
```

The isolated Console is available without changing either stable MinIO route:

```bash
curl --fail --silent --show-error --output /dev/null \
  https://silo-console.stage.codedang.com/
```

Confirm that:

- `silo-shadow-data` is Bound to a distinct PV on `skkuding-3`;
- the PV reclaim policy is `Retain`;
- the source PVC remains Bound on `skkuding-1`;
- the target restarts successfully without changing its PV identity;
- `silo-mirror` has zero replicas;
- `silo-console.stage.codedang.com` routes only to `silo-shadow:9090`;
- the stable API and MinIO Console hosts still route only to source MinIO.

Do not activate synchronization if any check fails.

## Phase 2: Activate Initial And Continuous Synchronization

Prepare one reviewed GitOps change that:

1. Adds `silo-migration-credentials` to `spec.users` in `tenant.yaml`.
2. Changes `silo-mirror` from zero to one replica.

The bootstrap init container creates target buckets, copies exact anonymous
bucket policies, preserves the four existing application identities and their
observed policies, and replaces the migration identity's temporary source
`consoleAdmin` attachment with the bucket-scoped `silo-migration-read` policy.
The three long-running containers then mirror current objects without
propagating source deletions.

Verify bootstrap and all mirrors:

```bash
kubectl --context stage rollout status deployment/silo-mirror -n minio --timeout=10m
kubectl --context stage get pod -n minio -l app=silo-mirror
kubectl --context stage logs -n minio deployment/silo-mirror -c bootstrap
kubectl --context stage logs -n minio deployment/silo-mirror -c testcase
kubectl --context stage logs -n minio deployment/silo-mirror -c media
kubectl --context stage logs -n minio deployment/silo-mirror -c plag-checks
```

Logs must contain no credentials, unresolved errors, or retry loops. Restart the
mirror pod once and prove that bootstrap is idempotent and mirroring resumes.

## Phase 3: Comparison And Compatibility Gate

Use a short-lived, reviewed comparison Job that mounts the source and target
administrative Secrets without logging their values. Record results outside
Git without object content.

Require all of the following:

- complete key, size, and material-metadata equality for all three buckets;
- full content checksums for all 650 preflight objects and every object added
  before cutover;
- equal object tags, including Iris's `hidden` testcase tag;
- equal anonymous bucket policies;
- unversioned, unlocked buckets with no lifecycle rules or notifications;
- authenticated list, read, range-read, put, multipart upload, tagging, delete,
  and presigned URL checks for every application identity;
- successful Silo restart with unchanged data and configuration;
- successful access through a local port-forward without changing stable
  routing.

Exercise source overwrite and delete behavior in a disposable object prefix.
Determine and record the exact final reconciliation command before scheduling
the maintenance window.

## Phase 4: Freeze Writes

Schedule the approved maintenance window. Prepare a GitOps change that stops
every application object writer without changing the stable MinIO endpoint.
At minimum it must:

- activate the stage maintenance response;
- stop admin API object writes and new presigned uploads;
- drain or hold RabbitMQ and BullMQ work that can cause object writes;
- stop Plag after in-flight work completes;
- stop Iris after in-flight work completes;
- verify no multipart upload or object mutation remains in flight.

Apply the freeze change through `main`, then prove each completion condition.
Do not proceed based only on replica counts.

## Phase 5: Final Reconciliation

While all writers remain frozen:

1. Run the rehearsed final source-to-target mirror.
2. Reconcile source deletions so no unexplained target-only key remains.
3. Repeat the complete comparison and authenticated target-read checks.
4. Record object counts, bytes, checksums, metadata, tags, and policy results.
5. Stop `silo-mirror` through a GitOps change that sets replicas to zero.
6. Confirm every mirror process has exited before opening target writes.

Any unexplained difference is a failed gate. Keep routing on MinIO and restore
writers if the freeze budget cannot accommodate diagnosis.

## Phase 6: Cut Over

In the same reviewed GitOps transition that keeps `silo-mirror` at zero, change
the two backends in `ingress.yaml`:

- API: `minio:80` to `silo-shadow:80`;
- Console: `minio-console:9090` to `silo-shadow:9090`.

Keep hostnames, DNS, and TLS Secrets unchanged. Restore one instance of each
consumer in this order:

1. admin API;
2. Plag and Iris;
3. remaining application replicas and queues.

Before general reopening, validate existing reads, one disposable upload,
range reads, object tags, multipart upload, presigned access, deletion,
frontend media, one end-to-end submission, and one plagiarism path. Make the
rollback decision within the 15-minute limited-exposure window.

## Rollback

Before target writes, restore both Ingress backends to MinIO and reopen writers
incrementally. No reverse copy is required.

After target writes, quiesce every Silo writer first. Prefer forward repair. A
cutback to MinIO accepts loss of target-only stage writes unless a separately
rehearsed reverse reconciliation is explicitly approved. Never allow both
stores to accept normal writes.

## Soak And Cleanup

- Keep source MinIO stopped or write-fenced, but retain its workload, PVC, PV,
  image, and credentials for at least 14 days.
- Observe S3 errors, p95 latency, pod restarts, Silo logs, node capacity, and PV
  identity for seven days before reconsidering monitoring migration.
- Revoke and remove the migration identity after the rollback deadline.
- Remove the source workload and PVC only through a separately reviewed cleanup
  change because the source PV uses reclaim policy `Delete`.
