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

# The patched Ubuntu package also drops AAA Certificate Services, the anchor of
# the Sectigo cross-sign path. Alpine's removal of it is not confirmed, so it
# is only recorded there.
require_aaa_absent=0

case "$family" in
  ubuntu)
    require_aaa_absent=1
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

subjects="$(
  openssl crl2pkcs7 -nocrl -certfile "$tmpdir/ca-certificates.crt" \
    | openssl pkcs7 -print_certs -noout \
    | grep '^subject'
)"
echo "Trust store subjects: $(grep -c '' <<<"$subjects")"

emsign="$(grep -c 'emSign ECC Root CA - G3' <<<"$subjects" || true)"
aaa="$(grep -c 'AAA Certificate Services' <<<"$subjects" || true)"

echo "emSign ECC Root CA - G3 subjects: ${emsign}"
if [[ "$require_aaa_absent" -eq 1 ]]; then
  echo "AAA Certificate Services subjects: ${aaa}"
else
  echo "AAA Certificate Services subjects: ${aaa} (recorded, not a failure for ${family})"
fi

failed=0
if [[ "$emsign" -ne 0 ]]; then
  echo "::error::${image} still trusts the emSign ECC Root CA - G3 root" >&2
  failed=1
fi
if [[ "$require_aaa_absent" -eq 1 && "$aaa" -ne 0 ]]; then
  echo "::error::${image} still trusts the AAA Certificate Services root" >&2
  failed=1
fi
exit "$failed"
