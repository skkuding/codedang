#!/usr/bin/env bash
# Fail if the frontend image can be built for the wrong environment.
#
# NEXT_PUBLIC_* values are inlined into the browser bundle at build time, so a
# production image that inherits the stage defaults talks to stage instead of
# production. This check keeps the Dockerfile defaults on production and
# requires every workflow that builds the image to pass its own environment's
# admin REST URL explicitly.
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

dockerfile=apps/frontend/Dockerfile
prod_workflow=.github/workflows/cd-prod-k8s.yml
stage_workflow=.github/workflows/cd-stage-k8s.yml
# ci.yml builds the images that previews deploy.
preview_workflow=.github/workflows/ci.yml

prod_admin_rest_url=https://codedang.com/admin-api
stage_admin_rest_url=https://stage.codedang.com/admin-api
admin_rest_arg="ADMIN_REST_URL="

errors=0

fail() {
  echo "::error::$*" >&2
  errors=1
}

# Prints "<ARG>=<value>" lines for the build args the frontend Dockerfile reads.
build_args() {
  local file="$1"
  if [[ ! -f "$file" ]]; then
    fail "missing $file"
    return 0
  fi
  grep -E '^[[:space:]]*(BASEURL|GQL_BASEURL|RUNNER_BASEURL|ADMIN_REST_URL)=' "$file" |
    sed -E 's/^[[:space:]]+//' || true
}

# 1. The Dockerfile defaults must be production values.
for arg in BASEURL GQL_BASEURL RUNNER_BASEURL ADMIN_REST_URL; do
  default="$(sed -n -E "s/^ARG ${arg}=\"([^\"]*)\"/\1/p" "$dockerfile" | head -n 1)"
  if [[ -z "$default" ]]; then
    fail "$dockerfile: missing default value for ARG $arg"
  elif [[ "$default" == *stage.* ]]; then
    fail "$dockerfile: ARG $arg default is $default, expected a production URL"
  fi
done

if ! grep -qxF "ARG ADMIN_REST_URL=\"${prod_admin_rest_url}\"" "$dockerfile"; then
  fail "$dockerfile: ARG ADMIN_REST_URL default must be ${prod_admin_rest_url}"
fi

# 2. Stage and preview builds must get stage URLs only.
for file in "$stage_workflow" "$preview_workflow"; do
  while IFS= read -r arg; do
    [[ -z "$arg" ]] && continue
    if [[ "$arg" == *"://codedang.com"* ]]; then
      fail "$file: $arg points at production, expected a stage URL"
    fi
  done < <(build_args "$file")

  if ! build_args "$file" | grep -qxF "${admin_rest_arg}${stage_admin_rest_url}"; then
    fail "$file: must pass ${admin_rest_arg}${stage_admin_rest_url}"
  fi
done

# 3. Production builds must get production URLs only, and the admin REST URL
#    must not depend on the Dockerfile default.
while IFS= read -r arg; do
  [[ -z "$arg" ]] && continue
  if [[ "$arg" == *stage.* ]]; then
    fail "$prod_workflow: $arg points at stage, expected a production URL"
  fi
done < <(build_args "$prod_workflow")

if ! build_args "$prod_workflow" | grep -qxF "${admin_rest_arg}${prod_admin_rest_url}"; then
  fail "$prod_workflow: must pass ${admin_rest_arg}${prod_admin_rest_url}"
fi

if [[ "$errors" -ne 0 ]]; then
  exit 1
fi

echo 'Frontend build args match their environments'
