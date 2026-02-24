# Codedang DR 재현 테스트 계획서

## Context

Codedang 프로젝트의 전체 인프라가 ArgoCD GitOps를 통해 복원 가능한지 검증하기 위한 Full DR(Disaster Recovery) 테스트 계획.
Production 클러스터의 ArgoCD가 stage/production 두 클러스터를 모두 관리하는 구조이므로, 두 클러스터 각각의 DR 시나리오를 다룬다.

---

## 현재 아키텍처 요약

### 복원 체인

```
AWS Secrets Manager (sealed-secrets 키)
  → bootstrap-cluster.sh
    → Sealed Secrets Controller + 키 복원
      → ArgoCD 설치 (argocd.yaml)
        → ArgoCD가 applications/ 디렉토리를 재귀적으로 읽음
          → 모든 ApplicationSet/Application 생성
            → 각 앱이 자동 sync → 전체 인프라 복원
```

### ArgoCD가 관리하는 리소스 (29개 Application 정의)

| 카테고리 | 앱 이름 | 환경 | sync 정책 | 비고 |
|---------|---------|------|-----------|------|
| **Core** | argocd | prod only | manual sync | 자기 자신 관리, automated 주석처리됨 |
| | argocd-image-updater | both | automated | 이미지 자동 업데이트 |
| | cert-manager | both | automated+prune | TLS 인증서 |
| | sealed-secrets | both | automated, prune=false | `preserveResourcesOnDeletion: true` |
| | sealed-secrets-backup | both | automated, prune=false | `preserveResourcesOnDeletion: true` |
| | k8s-internal | both | automated+prune | ClusterIssuer, Route53 credentials |
| **App** | client-api | both | automated+prune | image-updater 연동 |
| | admin-api | both | automated+prune | image-updater 연동 |
| | frontend | both | automated+prune | image-updater 연동 |
| | frontend-preview | both | automated+prune | PR 프리뷰 |
| | iris | both | automated+prune | 코드 채점 |
| | plag | both | automated+prune | 표절 검사 |
| | runner | both | automated+prune | Pod manager |
| | cloud-beaver-stage | stage only | - | Cloud 스토리지 관리 |
| **Stateful** | postgres-stage | stage only | prune=false | PVC 20Gi, 데이터 유실 위험 |
| | minio-stage | stage only | prune=false | PVC 20Gi, 데이터 유실 위험 |
| | rabbitmq | both | prune=false | `preserveResourcesOnDeletion: true` |
| | redis | both | prune=false | `preserveResourcesOnDeletion: true` |
| **Monitoring** | prometheus | both | `preserveResourcesOnDeletion: true` |
| | grafana | both | automated |
| | loki | both | `preserveResourcesOnDeletion: true` |
| | tempo | both | `preserveResourcesOnDeletion: true` |
| | promtail | both | automated |
| | otel-collector | both | automated |
| | monitoring-minio | both | - |
| **Utility** | kubernetes-dashboard | - | - |
| | headlamp | - | - |
| | actions-runner-controller | - | - |
| | arc-runner-scale-set | - | - |

### ArgoCD 외부 의존성 (복원 불가)

- **AWS Secrets Manager**: sealed-secrets 암호화 키 (bootstrap 필수)
- **AWS RDS**: production PostgreSQL 데이터
- **AWS S3**: production 오브젝트 스토리지 (testcase, media, plag-checks)
- **AWS ElastiCache**: production Redis
- **AWS Route53**: DNS 레코드 (Terraform 관리)
- **GHCR**: 컨테이너 이미지
- **GitHub**: Git 저장소 (ArgoCD source of truth)
- **Terraform state**: AWS 인프라 설정

---

## DR 시나리오

### 시나리오 1: Production 클러스터 전체 소실

가장 심각한 케이스. ArgoCD 자체가 사라지므로 전체 복원이 필요.

### 시나리오 2: Stage 클러스터 전체 소실

Production ArgoCD가 살아있으므로, stage 앱들이 자동 재배포를 시도함.
단, 새 클러스터의 kubeconfig를 ArgoCD에 재등록해야 할 수 있음.

### 시나리오 3: 양쪽 클러스터 모두 소실

시나리오 1 → 시나리오 2 순서로 복구.

---

## 인프라 환경

- **양쪽 모두 k3s** 기반 클러스터
- PVC는 k3s 기본 `local-path` provisioner 사용 → 데이터 경로: `/var/lib/rancher/k3s/storage/`
- **주의**: `k3s-uninstall.sh`는 `/var/lib/rancher/k3s/` 전체를 삭제하므로 PVC 데이터도 함께 소실됨

---

## 테스트 절차

### Phase 0: 사전 준비

- [ ] 현재 상태 스냅샷 촬영
  ```bash
  # Production 클러스터
  kubectl get applications -n argocd -o yaml > backup-apps-prod.yaml
  kubectl get all --all-namespaces -o wide > backup-resources-prod.txt
  kubectl get pvc --all-namespaces > backup-pvc-prod.txt
  kubectl get secrets --all-namespaces --no-headers | wc -l  # 시크릿 개수

  # Stage 클러스터
  kubectl --context stage get all --all-namespaces -o wide > backup-resources-stage.txt
  kubectl --context stage get pvc --all-namespaces > backup-pvc-stage.txt
  ```

- [ ] **PVC 데이터 백업** (k3s uninstall 전 필수)
  ```bash
  # Stage 클러스터 (PostgreSQL, MinIO 데이터 보존)
  ssh stage-node "sudo cp -a /var/lib/rancher/k3s/storage /tmp/k3s-storage-backup"

  # Production은 AWS RDS/S3 사용이라 PVC 백업 불필요 (모니터링 데이터만 해당)
  ```

- [ ] AWS Secrets Manager에서 sealed-secrets 키 다운로드 가능한지 확인
  ```bash
  aws secretsmanager get-secret-value --secret-id "Codedang-Sealed-Secrets-Production" --query SecretString --output text | jq '.items | length'
  # Expected: 8 (as of Jan 2026)
  aws secretsmanager get-secret-value --secret-id "Codedang-Sealed-Secrets-Stage" --query SecretString --output text | jq '.items | length'
  # Expected: 6 (as of Jan 2026)
  ```

- [ ] GHCR 이미지 접근 가능 확인
- [ ] Terraform state 무결성 확인 (production AWS 리소스)

---

### Phase 1: Production 클러스터 DR 테스트

#### Step 1.1: k3s 클러스터 재생성

```bash
# Option A: 완전 재설치 (PVC 데이터 보존)
sudo cp -a /var/lib/rancher/k3s/storage /tmp/k3s-storage-backup
k3s-uninstall.sh
curl -sfL https://get.k3s.io | sh -
sudo cp -a /tmp/k3s-storage-backup /var/lib/rancher/k3s/storage

# Option B: k3s reset만 수행 (storage 디렉토리 유지, k3s 데이터만 초기화)
sudo systemctl stop k3s
sudo rm -rf /var/lib/rancher/k3s/server/db    # etcd/SQLite 삭제
sudo rm -rf /var/lib/rancher/k3s/server/tls   # TLS 인증서 삭제
sudo systemctl start k3s
```

- [ ] Production 노드에서 k3s 재설치
- [ ] kubectl로 새 클러스터 접근 확인
- [ ] (Option A 사용 시) storage 백업 복원 확인

#### Step 1.2: Bootstrap 실행

```bash
cd codedang/infra
ENVIRONMENT=production ./bootstrap-cluster.sh
```

- [ ] sealed-secrets controller 설치 확인
- [ ] 암호화 키 복원 확인 (키 개수 일치)
- [ ] ArgoCD 설치 및 argocd-server Running 확인

#### Step 1.3: ArgoCD 자체 Sync

- [ ] ArgoCD Application (`argocd`)이 생성되었는지 확인
  - **주의**: argocd.yaml의 `syncPolicy.automated`가 주석처리되어 있으므로, **수동 sync 필요**
  ```bash
  # ArgoCD CLI로 수동 sync 또는 UI에서 sync
  argocd app sync argocd
  ```
- [ ] ArgoCD가 `applications/` 디렉토리를 읽어 모든 Application/ApplicationSet이 생성되는지 확인
  ```bash
  kubectl get applications -n argocd
  kubectl get applicationsets -n argocd
  ```

#### Step 1.4: 인프라 서비스 복원 확인

아래 순서대로 sync 상태를 확인 (의존성 순서):

1. **sealed-secrets-production** → SealedSecret 복호화 가능해야 다른 앱의 Secret 생성 가능
2. **cert-manager-production** → TLS 인증서 발급 필요 (RabbitMQ operator 등의 전제조건)
3. **k8s-internal-production** → ClusterIssuer, Route53 credentials
4. **redis-production** → 앱 서비스 의존
5. **rabbitmq-production** → 앱 서비스 의존 (Cluster Operator + Topology)
6. **application 서비스들** (client-api, admin-api, frontend, iris, plag, runner)
7. **모니터링 스택** (prometheus, grafana, loki, tempo, otel-collector, promtail)
8. **유틸리티** (argocd-image-updater, sealed-secrets-backup, dashboards, ARC)

#### Step 1.5: 검증 체크리스트 (Production)

**핵심 기능:**

- [ ] 모든 ArgoCD Application이 `Synced` + `Healthy` 상태
- [ ] SealedSecret → Secret 복호화 정상 동작
- [ ] cert-manager TLS 인증서 발급 정상
- [ ] RabbitMQ 클러스터 Running + Topology(exchange, queue) 생성
- [ ] 앱 서비스 Pod 정상 Running (client-api, admin-api, frontend, iris, plag, runner)
- [ ] Ingress를 통한 외부 접근 가능 (codedang.com, argocd.codedang.com 등)
- [ ] ArgoCD GitHub OAuth(Dex) 로그인 동작
- [ ] argocd-image-updater가 GHCR에서 최신 이미지 digest pull

**데이터 연결:**

- [ ] AWS RDS 연결 정상 (client-api, admin-api가 DB 접근 가능)
- [ ] AWS S3 연결 정상 (testcase, media 버킷 접근)
- [ ] AWS ElastiCache 연결 정상

**모니터링:**

- [ ] Prometheus 메트릭 수집 시작
- [ ] Grafana 대시보드 접근 가능
- [ ] Loki 로그 수집 시작
- [ ] Tempo 트레이스 수집 시작

---

### Phase 2: Stage 클러스터 DR 테스트

Production ArgoCD가 복원된 상태에서 진행.

#### Step 2.1: Stage k3s 클러스터 재생성

```bash
# PVC 백업 후 재설치
sudo cp -a /var/lib/rancher/k3s/storage /tmp/k3s-storage-backup
k3s-uninstall.sh
curl -sfL https://get.k3s.io | sh -
sudo cp -a /tmp/k3s-storage-backup /var/lib/rancher/k3s/storage
```

- [ ] Stage 노드에서 k3s 재설치 + PVC 복원
- [ ] ArgoCD에 stage 클러스터 재등록 필요 여부 확인
  - `cluster-stage` SealedSecret에 stage API server URL + credentials가 하드코딩
  - k3s 재설치 시 API server IP가 동일하면 URL은 유지되나, **서비스 어카운트 토큰은 변경됨**
  - 토큰이 변경되면 SealedSecret 재생성 필요 → `kubeseal`로 새 secret 암호화

#### Step 2.2: Stage용 Sealed Secrets 키 복원

Stage 클러스터에도 sealed-secrets controller + 키가 필요:

```bash
ENVIRONMENT=stage CLUSTER_CONTEXT=stage SKIP_ARGOCD=true ./bootstrap-cluster.sh
```

- `SKIP_ARGOCD=true`: stage는 production ArgoCD에서 원격 관리되므로 ArgoCD 설치를 스킵

#### Step 2.3: ArgoCD 자동 Sync 대기

- [ ] Production ArgoCD가 stage 클러스터에 앱들을 자동 배포하는지 확인
  ```bash
  kubectl get applications -n argocd | grep stage
  ```

#### Step 2.4: 검증 체크리스트 (Stage)

**핵심 기능:**

- [ ] 모든 stage Application이 `Synced` + `Healthy`
- [ ] PostgreSQL stage 기동 + PVC 데이터 정상 마운트 (백업 복원한 경우)
- [ ] MinIO stage 기동 + 버킷 데이터 정상 접근 (백업 복원한 경우)
- [ ] RabbitMQ stage 클러스터 + Topology 정상
- [ ] 앱 서비스 Pod 정상 Running
- [ ] Stage 전용 서비스: cloud-beaver 정상

**PVC 데이터 검증 (백업 복원 시):**

- [ ] PostgreSQL: PVC가 기존 데이터를 정상 마운트하는지 확인 (테이블/데이터 조회)
- [ ] MinIO: 3개 버킷(codedang-testcase, codedang-media, codedang-plag-checks) 존재 + 파일 접근
- [ ] PV/PVC 바인딩 상태 확인: `kubectl get pv,pvc --all-namespaces`
  - local-path provisioner가 복원된 디렉토리를 새 PV로 인식하지 못할 수 있음
  - 이 경우 수동으로 PV를 생성하고 기존 경로에 바인딩 필요

---

### Phase 3: E2E 기능 검증

양쪽 클러스터 복원 후 전체 기능 테스트:

- [ ] Production: 웹 UI 접근 → 로그인 → 문제 제출 → 채점 완료
- [ ] Stage: 웹 UI 접근 → 로그인 → 문제 제출 → 채점 완료
- [ ] ArgoCD UI에서 전체 앱 상태 Green 확인
- [ ] GitHub Actions runner가 연결되어 CI/CD 파이프라인 동작

---

## 식별된 위험 및 갭

### 1. ArgoCD 루트 앱 수동 Sync 필요

- `argocd.yaml`의 automated sync가 주석처리됨
- bootstrap 후 수동으로 sync해야 하위 앱들이 생성됨
- **영향**: 완전 자동 복원 불가, 수동 개입 1회 필요

### 2. Stage 클러스터 재등록 문제

- `cluster-stage` SealedSecret에 stage 클러스터의 API server URL + credentials가 하드코딩
- 클러스터 재생성 시 새 API endpoint/token이 발급되면 SealedSecret 재생성 필요
- **영향**: stage 클러스터 변경 시 SealedSecret 갱신 작업 필요

### 3. Stage PVC 복원의 불확실성

- k3s 재설치 후 `/var/lib/rancher/k3s/storage/` 를 복원해도, local-path provisioner가 기존 디렉토리를 새 PV로 자동 인식하지 못할 수 있음
- PVC 이름/UID가 달라지면 수동 PV 생성 + hostPath 바인딩이 필요
- **영향**: PVC 복원에 수동 작업이 필요할 수 있음 (이 부분이 DR 테스트의 핵심 검증 포인트)

### 4. Bootstrap 스크립트가 stage에 대해 불완전

- `bootstrap-cluster.sh`는 항상 ArgoCD를 설치함
- stage는 production ArgoCD에서 원격 관리되므로, sealed-secrets 키 복원만 필요
- **영향**: stage DR 시 bootstrap 스크립트 수정 또는 수동 키 복원 필요

### 5. Sync 순서 의존성

- cert-manager가 없으면 RabbitMQ operator가 실패할 수 있음
- sealed-secrets가 없으면 모든 SealedSecret → Secret 변환이 실패
- ArgoCD는 sync 순서를 보장하지 않으므로 일부 앱이 일시적 실패 후 재시도로 복구
- **영향**: 전체 복원에 시간 소요 (여러 sync 사이클 필요)

### 6. DNS/Ingress 복원 지연

- cert-manager가 Let's Encrypt 인증서를 재발급하는데 시간 소요
- Route53 DNS 전파 지연
- **영향**: 외부 접근 가능까지 수분~수십분 지연

---

## 테스트 결과 기록 템플릿

| 항목 | 기대 결과 | 실제 결과 | 소요 시간 | 비고 |
|------|----------|----------|----------|------|
| Bootstrap 완료 | sealed-secrets + ArgoCD 기동 | | | |
| Application 전체 생성 | 29개 앱 정의 생성 | | | |
| 전체 Synced+Healthy | 모든 앱 Green | | | |
| 외부 접근 가능 | HTTPS 정상 | | | |
| 제출→채점 E2E | 정상 동작 | | | |
| **총 복원 시간** | - | | | bootstrap~E2E 완료 |
