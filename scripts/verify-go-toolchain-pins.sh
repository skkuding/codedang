#!/usr/bin/env bash
# Fail if any Go module or builder image is pinned below the toolchain that
# contains the eMudhra SPKI distrusted-certificate list (CVE-2026-111943).
#
# This is the cheap, static half of the provenance gate. The CD workflows also
# inspect the Go version recorded inside each shipped binary.
set -euo pipefail

required="${1:-1.27.3}"
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

modules=(
  apps/iris
  apps/plag
  apps/runner/backend
  apps/runner/pod-manager
)
dockerfiles=(
  apps/iris/Dockerfile
  apps/plag/Dockerfile
  apps/runner/backend/Dockerfile
  apps/runner/pod-manager/Dockerfile
)

errors=0

version_at_least() {
  local want="$1" got="$2"
  [[ "$(printf '%s\n%s\n' "$want" "$got" | sort -V | head -n 1)" == "$want" ]]
}

for module in "${modules[@]}"; do
  toolchain="$(sed -n 's/^toolchain[[:space:]]\{1,\}\(go[0-9][0-9.]*\).*/\1/p' "$module/go.mod" | head -n 1)"
  if [[ -z "$toolchain" ]]; then
    echo "::error file=$module/go.mod::missing toolchain directive (want go$required)"
    errors=1
    continue
  fi

  version="${toolchain#go}"
  if ! [[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "::error file=$module/go.mod::toolchain must pin an exact patch release, got $toolchain"
    errors=1
  elif ! version_at_least "$required" "$version"; then
    echo "::error file=$module/go.mod::toolchain $toolchain is older than go$required"
    errors=1
  else
    echo "$module: toolchain $toolchain"
  fi
done

for dockerfile in "${dockerfiles[@]}"; do
  image="$(sed -n 's/^FROM[[:space:]]\{1,\}golang:\([^[:space:]]*\).*/\1/p' "$dockerfile" | head -n 1)"
  if [[ -z "$image" ]]; then
    echo "::error file=$dockerfile::no golang builder stage found"
    errors=1
    continue
  fi

  version="${image%-alpine}"
  if ! [[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "::error file=$dockerfile::builder must pin an exact patch release, got golang:$image"
    errors=1
  elif ! version_at_least "$required" "$version"; then
    echo "::error file=$dockerfile::builder golang:$image is older than golang:$required"
    errors=1
  else
    echo "$dockerfile: golang:$image"
  fi
done

if grep -nE '^[[:space:]]*RUN[[:space:]].*apk[[:space:]]+(add|update).*([[:space:]]|=)go([[:space:]]|$)' apps/runner/pod-manager/Dockerfile; then
  echo "::error file=apps/runner/pod-manager/Dockerfile::do not install Alpine's distro Go into the builder"
  errors=1
fi

if [[ "$errors" -ne 0 ]]; then
  exit 1
fi

echo "All Go toolchain pins are >= go$required"
