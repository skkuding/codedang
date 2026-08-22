# Headlamp

Headlamp is deployed to the stage and production clusters by the central Argo CD
`ApplicationSet` in `infra/k8s/argocd/applications/headlamp.yaml`.

The lab cluster has its own Argo CD instance, so its `Application` and Helm values
live together in `infra/k8s/headlamp/overlays/lab`. Keeping the lab `Application`
outside `infra/k8s/argocd/applications` prevents the production Argo CD app-of-apps
from attempting to manage it.

## Lab migration

The lab migration is split into two phases so the existing Kubernetes Dashboard
remains available while Headlamp is evaluated.

### Phase 1: deploy without ingress

After this configuration is merged into `main`, bootstrap the application in the
lab cluster's Argo CD:

```shell
kubectl --context lab apply \
  -f infra/k8s/headlamp/overlays/lab/application.yaml
```

Verify the Argo CD application and workload:

```shell
kubectl --context lab -n argocd get application headlamp-lab
kubectl --context lab -n headlamp get pods
kubectl --context lab -n headlamp port-forward service/headlamp 4466:80
```

Open `http://localhost:4466` and sign in with the token from the dedicated login
service account:

```shell
kubectl --context lab -n headlamp get secret headlamp-admin-token \
  -o jsonpath='{.data.token}' | base64 --decode
```

The Headlamp runtime pod uses its own unprivileged `headlamp` service account.
Administrator access is granted only to the separate `headlamp-admin` login
service account. The token value is populated by Kubernetes and is not stored in
Git.

### Phase 2: switch traffic

After Headlamp has been validated through port forwarding, enable its ingress for
`k8s.lab.skkuding.dev` and remove or disable the Kubernetes Dashboard ingress in
the same reviewed change. Do not expose both applications on the same host at the
same time.

If validation fails during phase 1, delete the `headlamp-lab` Argo CD application
or disable its automated sync. The existing Kubernetes Dashboard and its ingress
are unchanged, so rollback does not require a traffic switch.
