# x509 distrust regression tests

These tests prove that the Go and Node runtimes Codedang ships refuse
certificate chains that chain through the eMudhra intermediates whose private
keys were disclosed on 2026-10-17.

The fix lives in the toolchain/runtime, not in application code:

- Go 1.27.3 and 1.26.10 reject the eight intermediates by SPKI hash
  (CVE-2026-111943). Older Go releases keep trusting them.
- Node.js 22.23.4, 24.22.1 and 26.12.1 reject them. Earlier releases keep
  trusting them.

## Fixtures

`testdata/chains/` and the two JSON files are the public fixtures published at
<https://emudhra.we-have-a-problem.com/>. They contain public certificates
only.

| File | Source | SHA-256 |
| --- | --- | --- |
| `chains.zip` (unpacked into `testdata/chains/`) | disclosure site | `8a2edc81b6c51e3ad27d45ca1e441ec84c961e2dee0fc547f2a02c0f74315f95` |
| `impacted-intermediates.json` | disclosure site | `f67b3abe9b4879f4e91874ed041beccd71257f1db41c588c724ccf12aa90c59e` |
| `roots.json` | disclosure site | `119f32cd81a6b5a4e3c4c2df5fe07daa90dc43cafa123a62f0394f1895d92380` |
| `control/le-chain.pem` | `openssl s_client` to `valid-isrgrootx1.letsencrypt.org`, 2026-10-21 | `d9ce6a303ba60a46fb08f467153e56b8cb2c1f63c4b21be3dea54321c7442d50` |
| `control/isrg-root-x1.pem` | <https://letsencrypt.org/certs/isrgrootx1.pem> | `22b557a27055b33606b6559f37703928d3e4ad79f110b407d04986e1843543d1` |

The chain files are leaf first:

- `*-emudhra...pem`: leaf, compromised intermediate, `emSign Root TLS CA - G3`
  (itself cross-signed by `emSign ECC Root CA - G3`, which is the trust
  anchor in `roots.json`).
- `*-aaa-emudhra...pem`: leaf, compromised intermediate cross-signed by
  `AAA Certificate Services` (the trust anchor in `roots.json`).

`control/le-chain.pem` is leaf, `YR1`, `Root YR` (cross-signed by
`ISRG Root X1`); `control/isrg-root-x1.pem` is the trust anchor. The control
leaf expires on 2027-01-05, but both tests set `CurrentTime` inside the
fixture's validity window, so the control keeps working after that date.

Refreshing a fixture is a deliberate change: download the new file, record its
SHA-256 here, and re-run both test suites with an unpatched runtime to confirm
they still detect the vulnerability.

## Running

```sh
# Go: fails on toolchains without the SPKI block
cd tests/x509-distrust && go test ./...

# Node: offline fixture checks
node --test tests/x509-distrust/node.test.mjs

# Node: live handshake checks (needs internet and the disclosure site)
X509_DISTRUST_LIVE=1 node --test tests/x509-distrust/node.live.test.mjs
```

## Trust-store observation (2026-10-21)

Ubuntu `ca-certificates` `20260816ubuntu0.24.04.1` removes
`emSign ECC Root CA - G3` and `AAA Certificate Services` from the bundle, but
keeps the unrelated `emSign Root CA - C1` and `emSign ECC Root CA - C3`. A broad
`grep emSign` therefore does not mean the image is unpatched. The shipped CD
check asserts only the compromised G3 root and records AAA separately.

## Meaningfulness checks

A passing test is only useful if the previous runtime fails it.

- Go: `GOTOOLCHAIN=go1.25.9 go test ./...` must **fail**.
  All twelve `TestBlockedChainsAreRejected` subtests report
  `verification succeeded with 1 chain(s)`.
- Node: under Node 22.18.0, the live check must report `TRUSTED` for
  `dv-g3b-emudhra.we-have-a-problem.com` (and therefore fail).
  Under 22.23.4 both compromised hosts are rejected with `CERT_REVOKED`.
