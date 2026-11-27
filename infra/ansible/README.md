# Codedang Ansible

Kubernetes 클러스터와 Codedang 운영 환경을 구성하기 위한 Ansible 플레이북을 관리합니다.
파일 이름의 숫자는 새 클러스터를 만들 때의 실행 순서입니다. 중간에 단계가 추가되면 15, 25처럼 끼워 넣습니다.

| 플레이북 | 대상 | 하는 일 |
| --- | --- | --- |
| `playbooks/10_check_tools.yml` | 관리 PC (OS 무관) | 필요한 CLI·Python 모듈·collection 설치 여부 확인 (설치는 하지 않음) |
| `playbooks/20_setup_ssh_keys.yml` | 서버 | SSH 공개키, 포트, 인증 방식 설정. 공개키가 바뀔 때마다 단독으로도 실행 |
| `playbooks/30_k8s_cluster.yml` | 서버 (Debian) | containerd + kubeadm 클러스터 구성, Flannel 설치 |
| `playbooks/40_bootstrap_cluster.yml` | 관리 PC (kubeconfig) | Sealed Secrets 키 복원, Argo CD 설치. 시작할 때 `10_check_tools.yml`을 먼저 실행 |

## 새 클러스터 구성 순서

Debian 13 서버(또는 VM)를 설치한 뒤 다음 순서로 실행합니다. 예시는 stage입니다.

### Debian 설치 시 주의

- 사용자 `skkuding`을 만들고, **root 비밀번호를 비워** 설치하면 `sudo`가 설치되고 `skkuding`이 sudo 그룹에 들어갑니다.
  root 비밀번호를 설정하면 `sudo`가 없으므로 `apt install sudo && usermod -aG sudo skkuding`을 먼저 해야 합니다.
- 소프트웨어 선택에서 `SSH server`만 고르고 데스크톱 환경은 제외합니다.
- swap 파티션은 만들지 않는 것을 권장합니다(플레이북이 swap을 끄긴 합니다).
- hostname은 `inventory/<env>/hosts`의 `node_name`과 맞춥니다.
  `node_name`은 manifest의 `nodeSelector`에 쓰이므로 기존 이름(`skkuding-1` 등)을 유지합니다.
- 노드 IP는 inventory 호스트 이름(`serverN.skkuding.dev`)의 DNS A 레코드에서 가져옵니다
  (`playbooks/group_vars/k8s_cluster.yml`). DNS와 다른 IP를 써야 하는 노드만 inventory에 `node_ip=<IP>`를 적습니다.

### 10. 관리 PC 도구 확인

관리 PC의 OS는 사람마다 다르므로 설치는 각자 하고, 플레이북으로 준비 상태만 확인합니다.

```bash
cd infra/ansible
ansible-galaxy collection install -r requirements.yml
ansible-playbook playbooks/10_check_tools.yml
```

`kubectl`, `helm`, `aws`, `kubeseal`, `jq`, Python `kubernetes`·`dnspython` 모듈, 필요한 Ansible collection을 확인해
설치된 것(버전 포함)과 없는 것(설치 안내 링크 포함)을 출력합니다. 하나라도 없으면 실패로 끝납니다.

### 20. SSH 설정

새로 설치한 서버는 22번 포트로 열려 있으므로 처음 한 번은 22번으로 접속해 포트를 바꿉니다.

```bash
ansible-playbook -i inventory/stage playbooks/20_setup_ssh_keys.yml \
  --limit <서버> -e ansible_port=22 -e ssh_port=21541 --ask-pass --ask-become-pass
```

| 옵션 | 의미 |
| --- | --- |
| `-e ansible_port=22` | 이번 실행에서 접속할 포트 (새 서버는 22) |
| `-e ssh_port=21541` | 서버에 설정할 SSH 포트 (생략하면 `ansible_port`와 같음) |
| `--ask-pass` | 공개키 등록 전이므로 비밀번호로 접속 |

실행 후에는 비밀번호 로그인이 꺼지므로, 이후 실행에서는 `-e ansible_port=22`, `-e ssh_port`, `--ask-pass`가 필요 없습니다.
마지막 sshd 재시작 단계에서 22번 연결이 끊겨 실패로 보일 수 있으나, `ssh -p 21541`로 접속되면 정상입니다.

### 30. Kubernetes 클러스터 구성

```bash
ansible-playbook -i inventory/stage playbooks/30_k8s_cluster.yml --ask-become-pass
```

- 모든 노드: containerd 2.x(Docker 저장소), kubelet/kubeadm/kubectl(`k8s_version`, hold), swap off,
  `overlay`/`br_netfilter`/`iscsi_tcp` 모듈, sysctl, Longhorn용 `open-iscsi`/`nfs-common`
- 첫 control-plane: `kubeadm init` → Flannel 설치 → 관리 PC에 kubeconfig 저장(`~/.kube/<k8s_cluster_name>.conf`)
- 나머지 control-plane/worker: `kubeadm join` (이미 join된 노드는 건너뜀)
- control-plane에도 워크로드를 배치합니다(기존 k3s와 동일).

클러스터 설정은 `inventory/<env>/hosts`의 `[k8s_cluster:vars]`에 있습니다.

| 변수 | stage 값 | 설명 |
| --- | --- | --- |
| `k8s_cluster_name` | `codedang-stage` | 클러스터 이름, kubeconfig 파일 이름 |
| `k8s_version` | `1.34.13` | kubelet/kubeadm/kubectl 버전 |
| `k8s_control_plane_endpoint` | `k8s-api.stage.codedang.com` | kubeadm `controlPlaneEndpoint`. 각 노드 `/etc/hosts`에서 첫 control-plane IP를 가리키며, 나중에 VIP로 바꾸기 쉽게 이름을 쓴다 |
| `k8s_pod_subnet` / `k8s_service_subnet` | `10.44.0.0/16` / `10.45.0.0/16` | 기존 k3s(10.42/10.43)와 겹치지 않게 함 |

```bash
export KUBECONFIG=~/.kube/codedang-stage.conf
kubectl get nodes -o wide
```

### 40. Sealed Secrets 키 복원과 Argo CD

Sealed Secrets 키는 S3 백업(`s3://codedang-sealed-secrets-backup/<env>/latest.json`)에서 복원합니다.
자세한 내용은 아래 절을 참고합니다.

```bash
ENVIRONMENT=stage SKIP_ARGOCD=true \
KUBECONFIG=~/.kube/codedang-stage.conf \
  ansible-playbook playbooks/40_bootstrap_cluster.yml
```

S3 대신 기존 클러스터에서 직접 백업한 키 파일을 쓰려면 `SEALED_SECRETS_KEYS_FILE=/path/to/sealed-secrets-keys.yaml`을 추가합니다.

## Kubernetes 클러스터 부트스트랩

`playbooks/40_bootstrap_cluster.yml`은 Kubernetes가 설치된 클러스터에 다음 구성요소를 준비합니다.

- Sealed Secrets controller 설치
- Sealed Secrets 복호화 키 복원 (S3 백업 또는 `SEALED_SECRETS_KEYS_FILE`로 지정한 백업 파일)
- Argo CD 설치
- Argo CD self-management Application 적용
- 주요 구성요소의 준비 상태 확인

이 플레이북은 Kubernetes 노드에 SSH로 접속하지 않습니다. 대상 클러스터의 kubeconfig와 AWS 자격 증명을 가진 관리 머신에서 로컬로 실행합니다.

### 사전 요구 사항

관리 머신에 다음 항목이 준비되어 있어야 합니다.

- Ansible
- 대상 Kubernetes 클러스터의 kubeconfig
- `s3://codedang-sealed-secrets-backup`을 읽을 수 있는 AWS 자격 증명 (`s3:GetObject`)
- Python 3와 `pip`

플레이북은 `kubectl`, `helm`, `aws`, `kubeseal`, `jq` CLI를 사용합니다. 시작할 때 `10_check_tools.yml`을 먼저 실행하며, 하나라도 없으면 아무것도 변경하지 않고 실패합니다. 도구는 자동 설치하지 않으므로 출력된 목록을 보고 직접 설치합니다.

### Ansible 의존성 설치

저장소의 `infra/ansible` 디렉터리로 이동한 후 필요한 collection을 설치합니다.

```bash
cd infra/ansible
ansible-galaxy collection install -r requirements.yml
```

`kubernetes.core` collection이 사용하는 Python Kubernetes 클라이언트도 설치합니다.

```bash
python3 -m pip install kubernetes
```

### Production 클러스터 부트스트랩

현재 kubeconfig context가 production 클러스터를 가리키는 경우 다음과 같이 실행합니다.

```bash
ansible-playbook playbooks/40_bootstrap_cluster.yml
```

context를 명시하려면 `CLUSTER_CONTEXT`를 지정합니다.

```bash
CLUSTER_CONTEXT=production \
  ansible-playbook playbooks/40_bootstrap_cluster.yml
```

Production 실행에는 다음 기본값이 적용됩니다.

```text
ENVIRONMENT=production
SKIP_ARGOCD=false
```

### Stage 클러스터 부트스트랩

Stage 클러스터가 production Argo CD에 의해 관리되는 경우, stage에는 Argo CD를 별도로 설치하지 않습니다.

```bash
ENVIRONMENT=stage \
CLUSTER_CONTEXT=stage \
SKIP_ARGOCD=true \
  ansible-playbook playbooks/40_bootstrap_cluster.yml
```

이 경우 Sealed Secrets controller와 stage 복호화 키만 준비합니다.

### 설정 변수

| 환경변수 | Ansible 변수 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `ENVIRONMENT` | `codedang_environment` | `production` | `production` 또는 `stage` 환경을 선택합니다. |
| `CLUSTER_CONTEXT` | `cluster_context` | 현재 context | 대상 kubeconfig context를 지정합니다. |
| `SEALED_SECRETS_S3_URI` | `sealed_secrets_s3_uri` | `s3://codedang-sealed-secrets-backup/<env>/latest.json` | 키 백업 위치. 특정 시점으로 복원하려면 `<env>/snapshots/<timestamp>.json`을 지정합니다. |
| `SEALED_SECRETS_KEYS_FILE` | `sealed_secrets_keys_file` | (없음) | 지정하면 S3 대신 이 로컬 백업 파일에서 키를 복원합니다. |
| `SKIP_ARGOCD` | `skip_argocd` | `false` | Argo CD 설치를 생략할지 결정합니다. |

환경변수 대신 Ansible extra variable로 전달할 수도 있습니다.

```bash
ansible-playbook playbooks/40_bootstrap_cluster.yml \
  -e codedang_environment=stage \
  -e cluster_context=stage \
  -e skip_argocd=true
```

### 구성요소별 실행

Sealed Secrets 관련 태스크만 실행합니다.

```bash
ansible-playbook playbooks/40_bootstrap_cluster.yml --tags sealed_secrets
```

Argo CD 관련 태스크만 실행합니다.

```bash
ansible-playbook playbooks/40_bootstrap_cluster.yml --tags argocd
```

새 클러스터에서는 Argo CD가 사용하는 Secret을 복호화할 수 있도록 Sealed Secrets를 먼저 구성해야 합니다.

### 실행 후 확인

Sealed Secrets 상태를 확인합니다.

```bash
kubectl -n kube-system get deployment sealed-secrets
kubectl -n kube-system get secret \
  -l sealedsecrets.bitnami.com/sealed-secrets-key
```

Argo CD 상태를 확인합니다.

```bash
kubectl -n argocd get pods
kubectl -n argocd get applications
```

특정 context를 사용한다면 확인 명령에도 `--context`를 지정해야 합니다.

```bash
kubectl --context stage -n kube-system get deployment sealed-secrets
```

## SSH 공개키 설정

`playbooks/20_setup_ssh_keys.yml`은 inventory에 등록된 서버의 SSH 공개키 인증과 SSH daemon 설정을 관리합니다.
`ssh_publickey/`의 공개키가 추가·삭제될 때마다 각 환경에 단독으로 실행합니다.

대상 환경의 inventory를 명시하여 실행합니다.

```bash
ansible-playbook -i inventory/stage playbooks/20_setup_ssh_keys.yml \
  --ask-become-pass
```

비밀번호 없이 `sudo`를 사용할 수 있다면 `--ask-become-pass`는 생략할 수 있습니다.
