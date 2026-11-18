#!/usr/bin/env bash
# Verify that a Go binary inside a container image was built with a toolchain
# that contains the eMudhra SPKI distrusted-certificate list.
#
# usage: verify-go-image.sh <image> <binary-path> [minimum-go-version]
set -euo pipefail

image="${1:?usage: verify-go-image.sh <image> <binary-path> [minimum-go-version]}"
binary="${2:?usage: verify-go-image.sh <image> <binary-path> [minimum-go-version]}"
required="${3:-go1.27.3}"

tmpdir="$(mktemp -d)"
container=""

cleanup() {
  if [[ -n "$container" ]]; then
    docker rm -f "$container" >/dev/null 2>&1 || true
  fi
  rm -rf "$tmpdir"
}
trap cleanup EXIT

echo "Pulling $image"
docker pull "$image"

container="$(docker create "$image")"
docker cp "$container:$binary" "$tmpdir/binary"

got="$(go version "$tmpdir/binary" | awk '{print $2}')"
echo "Binary $binary was built with $got"
go version -m "$tmpdir/binary" | sed -n '1p'

if [[ "$(printf '%s\n%s\n' "$required" "$got" | sort -V | head -n 1)" != "$required" ]]; then
  echo "::error::${image}:${binary} was built with $got, need $required or newer" >&2
  exit 1
fi
