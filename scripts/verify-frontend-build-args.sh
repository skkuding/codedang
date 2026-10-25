#!/usr/bin/env bash
# Fail if the frontend image can be built for the wrong environment.
#
# NEXT_PUBLIC_* values are inlined into the browser bundle at build time, so a
# production image that inherits the stage defaults talks to stage instead of
# production. This check keeps the Dockerfile defaults on production, requires
# every workflow that builds the image to pass its own environment's values
# explicitly, and verifies the Dockerfile still forwards them to ENV.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

dockerfile=apps/frontend/Dockerfile
prod_workflow=.github/workflows/cd-prod-k8s.yml
stage_workflow=.github/workflows/cd-stage-k8s.yml
# ci.yml builds the images that previews deploy.
preview_workflow=.github/workflows/ci.yml
# Inert on GitHub, but a restored copy of it would build the frontend image.
legacy_stage_workflow=.github/workflows/legacy/cd-stage.yml

prod_admin_rest_url=https://codedang.com/admin-api
stage_admin_rest_url=https://stage.codedang.com/admin-api
stage_base_url=https://stage.codedang.com/api
stage_gql_base_url=https://stage.codedang.com/graphql
stage_runner_base_url=wss://run.stage.codedang.com/run

errors=0

fail() {
  local file="$1"
  shift
  echo "::error file=${file}::$*" >&2
  errors=1
}

# Prints the build-args of the step that builds apps/frontend/Dockerfile, as
# "<ARG>=<value>" lines. Restricting to that step keeps an arg passed to another
# image in the same workflow from satisfying the check.
frontend_build_args() {
  local file="$1"
  if [[ ! -f "$file" ]]; then
    fail "$file" "missing $file"
    return 0
  fi
  awk '
    /^[[:space:]]*file:[[:space:]]*\.\/apps\/frontend\/Dockerfile/ {
      step = 1
      next
    }
    step && /^[[:space:]]*build-args:[[:space:]]*\|/ {
      match($0, /^[[:space:]]*/)
      base = RLENGTH
      block = 1
      next
    }
    block {
      if ($0 !~ /[^[:space:]]/) next
      match($0, /^[[:space:]]*/)
      if (RLENGTH <= base) exit
      sub(/^[[:space:]]+/, "")
      print
    }
  ' "$file"
}

# Every value that points at codedang.com must point at the expected
# environment. A value without "stage." is a production value.
expect_only_environment() {
  local file="$1" args="$2" line
  while IFS= read -r line; do
    [[ -z "$line" ]] && continue
    [[ "$line" == *codedang.com* ]] || continue
    if [[ "$line" == *stage.codedang.com* ]]; then
      fail "$file" "$line points at stage, expected a production URL"
    fi
  done <<<"$args"
}

# 1. The Dockerfile defaults must be production values.
declare -A prod_defaults=(
  [BASEURL]="https://codedang.com/api"
  [GQL_BASEURL]="https://codedang.com/graphql"
  [RUNNER_BASEURL]="wss://run.codedang.com/run"
  [ADMIN_REST_URL]="https://codedang.com/admin-api"
)
for arg in "${!prod_defaults[@]}"; do
  default="$(sed -n -E "s/^ARG ${arg}=\"([^\"]*)\"/\1/p" "$dockerfile" | head -n 1)"
  if [[ -z "$default" ]]; then
    fail "$dockerfile" "missing default value for ARG $arg"
  elif [[ "$default" != "${prod_defaults[$arg]}" ]]; then
    fail "$dockerfile" "ARG $arg defaults to $default, expected ${prod_defaults[$arg]}"
  fi
done

# 2. The build stage and the runtime stage must forward the ARG to ENV.
forwarded="$(grep -cxF 'ENV NEXT_PUBLIC_ADMIN_REST_URL=${ADMIN_REST_URL}' "$dockerfile" || true)"
if [[ "$forwarded" -lt 2 ]]; then
  fail "$dockerfile" \
    "ENV NEXT_PUBLIC_ADMIN_REST_URL=\${ADMIN_REST_URL} must appear in both the build and production stages"
fi

checked_workflows=("$prod_workflow" "$stage_workflow" "$preview_workflow" "$legacy_stage_workflow")
declare -A args_by_workflow=()
for file in "${checked_workflows[@]}"; do
  args_by_workflow[$file]="$(frontend_build_args "$file")"
  if [[ -z "${args_by_workflow[$file]}" ]]; then
    fail "$file" "the frontend build step passes no build args"
  fi
done

# 3. Production builds must pass production values and never a stage value.
args_list="${args_by_workflow[$prod_workflow]}"
expect_only_environment "$prod_workflow" "$args_list"
if ! grep -qxF "ADMIN_REST_URL=${prod_admin_rest_url}" <<<"$args_list"; then
  fail "$prod_workflow" "the frontend build must pass ADMIN_REST_URL=${prod_admin_rest_url}"
fi

# 4. Stage and preview builds must pass stage values explicitly and never a
#    production value. Each environment names its own URLs instead of relying
#    on the Dockerfile defaults.
stage_requirements() {
  case "$1" in
    "$preview_workflow" | "$legacy_stage_workflow")
      echo "BASEURL=${stage_base_url} GQL_BASEURL=${stage_gql_base_url} ADMIN_REST_URL=${stage_admin_rest_url}"
      ;;
    *)
      echo "BASEURL=${stage_base_url} GQL_BASEURL=${stage_gql_base_url} RUNNER_BASEURL=${stage_runner_base_url} ADMIN_REST_URL=${stage_admin_rest_url}"
      ;;
  esac
}

for file in "$stage_workflow" "$preview_workflow" "$legacy_stage_workflow"; do
  args_list="${args_by_workflow[$file]}"
  while IFS= read -r line; do
    [[ -z "$line" ]] && continue
    [[ "$line" == *codedang.com* ]] || continue
    if [[ "$line" != *stage.codedang.com* ]]; then
      fail "$file" "$line points at production, expected a stage URL"
    fi
  done <<<"$args_list"
  for wanted in $(stage_requirements "$file"); do
    if ! grep -qxF "$wanted" <<<"$args_list"; then
      fail "$file" "the frontend build must pass $wanted"
    fi
  done
done

if [[ "$errors" -ne 0 ]]; then
  exit 1
fi

echo 'Frontend build args match their environments'
