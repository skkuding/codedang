#!/bin/bash

# 컨테이너 ID 추출 (예: /proc/self/cgroup에서 추출)
CONTAINER_ID=$(head -1 /proc/self/cgroup | cut -d/ -f3)
# docker- 접두사와 .scope 접미사 제거 (예: docker-5340af7...scope -> 5340af7...)
CONTAINER_ID=$(echo "$CONTAINER_ID" | sed -e 's/docker-\(.*\)\.scope/\1/')
echo "Container ID: $CONTAINER_ID"

# 고유 cgroup 디렉터리 생성 (예: /sys/fs/cgroup/sandbox-${CONTAINER_ID})
SANDBOX_CG="/sys/fs/cgroup/sandbox-${CONTAINER_ID}"
if [ ! -d "$SANDBOX_CG" ]; then
    if [ "$(id -u)" -eq 0 ]; then
        # 현재 사용자가 root인 경우 sudo 없이 생성
        mkdir -p "$SANDBOX_CG" || { echo "Failed to create cgroup directory $SANDBOX_CG" >&2; exit 1; }
        # 해당 cgroup의 하위 그룹들이 메모리 컨트롤러를 사용할 수 있도록 추가하도록 설정
        echo "+memory" > "$SANDBOX_CG/cgroup.subtree_control"
    else
        # root가 아닌 경우, sudo가 있으면 sudo 사용
        if command -v sudo >/dev/null 2>&1; then
            sudo mkdir -p "$SANDBOX_CG" || { echo "Failed to create cgroup directory $SANDBOX_CG" >&2; exit 1; }
            # 해당 cgroup의 하위 그룹들이 메모리 컨트롤러를 사용할 수 있도록 추가하도록 설정
            sudo echo "+memory" | sudo tee "$SANDBOX_CG/cgroup.subtree_control"
        else
            echo "Error: not running as root and sudo is not available to create $SANDBOX_CG" >&2
            exit 1
        fi
    fi
    echo "Created cgroup directory $SANDBOX_CG"
fi

# CONTAINER_ID를 환경 변수로 설정하고 ~/.bashrc에 추가
echo "export CONTAINER_ID=$CONTAINER_ID" >> ~/.bashrc
export CONTAINER_ID=$CONTAINER_ID
source ~/.bashrc

if [[ -n "$APP_ENV" && $APP_ENV = "production" ]]
    then ECS_CONTAINER_ID=$(head -1 /proc/self/cgroup | cut -d/ -f4)
    ./plag $ECS_CONTAINER_ID
else
    ./plag
fi
