#!/usr/bin/env bash
# Verify the trust store inside a rebuilt runtime image.
#
# usage: verify-ca-certificates.sh <image> <ubuntu|alpine> [minimum-version]
set -euo pipefail

image="${1:?usage: verify-ca-certificates.sh <image> <ubuntu|alpine> [minimum-version]}"
family="${2:?usage: verify-ca-certificates.sh <image> <ubuntu|alpine> [minimum-version]}"

tmpdir="$(mktemp -d)"
container=""

cleanup() {
  if [[ -n "$container" ]]; then
    docker rm -f "$container" >/dev/null 2>&1 || true
  fi
  rm -rf "$tmpdir"
}
trap cleanup EXIT

case "$family" in
  ubuntu)
    required="${3:-20260816ubuntu0.24.04.1}"
    installed="$(docker run --rm --entrypoint dpkg-query "$image" -W -f='${Version}' ca-certificates)"
    if ! dpkg --compare-versions "$installed" ge "$required"; then
      echo "::error::${image} ships ca-certificates ${installed}, need ${required} or newer" >&2
      exit 1
    fi
    ;;
  alpine)
    required="${3:-20261020-r0}"
    package="$(docker run --rm --entrypoint apk "$image" info -v ca-certificates)"
    installed="${package#ca-certificates-}"
    comparison="$(docker run --rm --entrypoint apk "$image" version -t "$installed" "$required")"
    if [[ "$comparison" == "<" ]]; then
      echo "::error::${image} ships ca-certificates ${installed}, need ${required} or newer" >&2
      exit 1
    fi
    ;;
  *)
    echo "::error::unknown family ${family}" >&2
    exit 2
    ;;
esac

echo "ca-certificates: ${installed}"

# Read the bundle on the host so the image does not need the openssl CLI.
container="$(docker create "$image")"
docker cp "$container:/etc/ssl/certs/ca-certificates.crt" "$tmpdir/ca-certificates.crt"

subjects() {
  openssl crl2pkcs7 -nocrl -certfile "$tmpdir/ca-certificates.crt" \
    | openssl pkcs7 -print_certs -noout \
    | grep '^subject'
}

emsign="$(subjects | grep -c 'emSign ECC Root CA - G3' || true)"
aaa="$(subjects | grep -c 'AAA Certificate Services' || true)"

echo "emSign ECC Root CA - G3 subjects: ${emsign}"
echo "AAA Certificate Services subjects: ${aaa} (recorded, not a failure)"

if [[ "$emsign" -ne 0 ]]; then
  echo "::error::${image} still trusts the emSign ECC Root CA - G3 root" >&2
  exit 1
fi
