import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import tls from 'node:tls'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const testdata = path.join(here, 'testdata')
const chainDir = path.join(testdata, 'chains')

const roots = JSON.parse(
  fs.readFileSync(path.join(testdata, 'roots.json'), 'utf8')
)
const impacted = JSON.parse(
  fs.readFileSync(path.join(testdata, 'impacted-intermediates.json'), 'utf8')
)

function pemCertificates(text) {
  return [
    ...text.matchAll(
      /-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g
    )
  ].map((match) => match[0])
}

function readChain(file) {
  const blocks = pemCertificates(fs.readFileSync(file, 'utf8'))
  assert.ok(
    blocks.length >= 2,
    `${file} must contain a leaf and at least one intermediate`
  )
  return blocks.map((pem) => new crypto.X509Certificate(pem))
}

function root(name) {
  const entry = roots.find((candidate) => candidate.name === name)
  assert.ok(entry, `root ${JSON.stringify(name)} is missing from roots.json`)
  return new crypto.X509Certificate(entry.pem)
}

function sha256(certificate) {
  return crypto.createHash('sha256').update(certificate.raw).digest('hex')
}

const chainFiles = fs
  .readdirSync(chainDir)
  .filter((file) => file.endsWith('.pem'))
  .sort()

test('fixtures contain every published chain', () => {
  assert.equal(chainFiles.length, 12)
})

for (const file of chainFiles) {
  test(`fixture: ${file}`, () => {
    const [leaf, ...intermediates] = readChain(path.join(chainDir, file))
    const isSectigoPath = file.includes('-aaa-')
    const trustAnchor = root(
      isSectigoPath ? 'AAA Certificate Services' : 'emSign ECC Root CA - G3'
    )

    // The first intermediate must be one of the eight disclosed intermediates.
    const match = impacted.find(
      (entry) => entry.sha256.toLowerCase() === sha256(intermediates[0])
    )
    assert.ok(
      match,
      `first intermediate ${intermediates[0].subject} is not in impacted-intermediates.json`
    )
    assert.equal(match.usage, 'tls')

    // The fixture must actually be the chain we think it is: each certificate
    // must have been issued by the next one, ending at the trusted root.
    assert.ok(
      leaf.checkIssued(intermediates[0]),
      'leaf must be issued by the compromised intermediate'
    )
    for (let i = 0; i < intermediates.length - 1; i += 1) {
      assert.ok(
        intermediates[i].checkIssued(intermediates[i + 1]),
        `${intermediates[i].subject} must be issued by ${intermediates[i + 1].subject}`
      )
    }
    assert.ok(
      intermediates.at(-1).checkIssued(trustAnchor),
      `${intermediates.at(-1).subject} must be issued by ${trustAnchor.subject}`
    )
  })
}

test('bundled root store contents (informational)', (t) => {
  const bundled = new Set(
    tls.rootCertificates.map(
      (pem) => new crypto.X509Certificate(pem).fingerprint256
    )
  )

  for (const entry of roots) {
    const certificate = new crypto.X509Certificate(entry.pem)
    const present = bundled.has(certificate.fingerprint256)
    t.diagnostic(
      `${entry.name}: ${present ? 'present in' : 'absent from'} tls.rootCertificates`
    )
  }
})

test('Node runtime is at least a patched release', () => {
  const [major, minor, patch] = process.versions.node.split('.').map(Number)
  const patched = (() => {
    if (major === 22) return minor > 23 || (minor === 23 && patch >= 4)
    if (major === 24) return minor > 22 || (minor === 22 && patch >= 1)
    if (major === 26) return minor > 12 || (minor === 12 && patch >= 1)
    return false
  })()

  assert.ok(
    patched,
    `Node ${process.versions.node} does not contain the eMudhra distrust list; ` +
      'use 22.23.4+, 24.22.1+ or 26.12.1+'
  )
})
