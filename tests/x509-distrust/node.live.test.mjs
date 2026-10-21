// Live distrust check against the disclosure site's test hosts.
//
// This layer needs the public internet and the disclosure site to stay up, so
// it only runs when X509_DISTRUST_LIVE=1 (see the x509-distrust CI job).
import assert from 'node:assert/strict';
import https from 'node:https';
import test from 'node:test';

const live = process.env.X509_DISTRUST_LIVE === '1';

const COMPROMISED_HOSTS = [
  'dv-g3b-emudhra.we-have-a-problem.com', // emSign path
  'dv-g3b-aaa-emudhra.we-have-a-problem.com', // Sectigo cross-sign path
];
const CONTROL_HOST = 'codedang.com';

const CERTIFICATE_ERROR_PREFIXES = ['CERT_', 'ERR_TLS_CERT_'];
const CERTIFICATE_ERROR_CODES = new Set([
  'DEPTH_ZERO_SELF_SIGNED_CERT',
  'SELF_SIGNED_CERT_IN_CHAIN',
  'UNABLE_TO_GET_ISSUER_CERT',
  'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
  'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
]);

function isCertificateError(code) {
  if (!code) return false;
  return (
    CERTIFICATE_ERROR_CODES.has(code) ||
    CERTIFICATE_ERROR_PREFIXES.some((prefix) => code.startsWith(prefix))
  );
}

function probeOnce(host) {
  return new Promise((resolve) => {
    const req = https.get(
      { hostname: host, port: 443, path: '/', timeout: 15_000 },
      (response) => {
        response.resume();
        resolve({ kind: 'trusted', statusCode: response.statusCode });
      },
    );

    req.on('timeout', () => {
      req.destroy(Object.assign(new Error('request timed out'), { code: 'ETIMEDOUT' }));
    });
    req.on('error', (error) => {
      if (isCertificateError(error.code)) {
        resolve({ kind: 'certificate', code: error.code, message: error.message });
      } else {
        resolve({ kind: 'network', code: error.code, message: error.message });
      }
    });
  });
}

// A DNS or connect failure is inconclusive, not a pass. Retry once so a
// transient reset does not fail the required check.
async function probe(host) {
  let result = await probeOnce(host);
  if (result.kind === 'network') {
    await new Promise((resolve) => setTimeout(resolve, 2_000));
    result = await probeOnce(host);
  }
  return result;
}

test(
  'live: compromised hosts are rejected with a certificate error',
  { skip: live ? false : 'set X509_DISTRUST_LIVE=1 to run the live check' },
  async (t) => {
    for (const host of COMPROMISED_HOSTS) {
      await t.test(host, async () => {
        const result = await probe(host);

        if (result.kind === 'trusted') {
          assert.fail(
            `${host} was TRUSTED (HTTP ${result.statusCode}); this runtime does not distrust the ` +
              'compromised eMudhra intermediates',
          );
        }
        if (result.kind === 'network') {
          assert.fail(
            `INCONCLUSIVE: ${host} failed before certificate verification ` +
              `(${result.code ?? 'unknown'}: ${result.message ?? ''})`,
          );
        }
        assert.equal(result.kind, 'certificate', `${host} must fail certificate verification`);
      });
    }
  },
);

test(
  'live: control host is trusted',
  { skip: live ? false : 'set X509_DISTRUST_LIVE=1 to run the live check' },
  async () => {
    const result = await probe(CONTROL_HOST);
    if (result.kind === 'network') {
      assert.fail(
        `INCONCLUSIVE: ${CONTROL_HOST} failed before certificate verification ` +
          `(${result.code ?? 'unknown'}: ${result.message ?? ''})`,
      );
    }
    assert.equal(result.kind, 'trusted', `${CONTROL_HOST} must remain trusted`);
  },
);
