#!/usr/bin/env bash
# Verify that an image runs an exact patched Node.js release.
#
# usage: verify-node-image.sh <image> [expected-version]
set -euo pipefail

image="${1:?usage: verify-node-image.sh <image> [expected-version]}"
expected="${2:-v22.23.4}"

got="$(docker run --rm --entrypoint node "$image" -v)"
echo "Node in $image: $got"

if [[ "$got" != "$expected" ]]; then
  echo "::error::${image} runs Node $got, need $expected" >&2
  exit 1
fi
