// Package x509distrust checks that the Go toolchain used to build Codedang
// refuses certificate chains that terminate in the compromised eMudhra
// intermediates.
//
// The fixtures under testdata/ are the public chains served by the disclosure
// site's test hosts. See testdata/README.md for provenance.
package x509distrust

import (
	"crypto/sha256"
	"crypto/x509"
	"encoding/hex"
	"encoding/json"
	"encoding/pem"
	"os"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
	"testing"
	"time"
)

const (
	emSignRootName = "emSign ECC Root CA - G3"
	aaaRootName    = "AAA Certificate Services"

	// Minimum toolchain that contains the SPKI distrusted-certificate list.
	minGoVersion = "go1.27.3"
)

type rootEntry struct {
	Name string `json:"name"`
	PEM  string `json:"pem"`
}

type impactedIntermediate struct {
	Name   string `json:"name"`
	SHA256 string `json:"sha256"`
	Usage  string `json:"usage"`
}

func parseCertificates(t *testing.T, data []byte) []*x509.Certificate {
	t.Helper()

	var certs []*x509.Certificate
	for {
		var block *pem.Block
		block, data = pem.Decode(data)
		if block == nil {
			break
		}
		if block.Type != "CERTIFICATE" {
			continue
		}
		cert, err := x509.ParseCertificate(block.Bytes)
		if err != nil {
			t.Fatalf("parse certificate: %v", err)
		}
		certs = append(certs, cert)
	}
	return certs
}

func readCertificates(t *testing.T, path string) []*x509.Certificate {
	t.Helper()

	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("read %s: %v", path, err)
	}
	certs := parseCertificates(t, data)
	if len(certs) == 0 {
		t.Fatalf("%s contains no certificates", path)
	}
	return certs
}

func loadRoots(t *testing.T) map[string]*x509.Certificate {
	t.Helper()

	data, err := os.ReadFile("testdata/roots.json")
	if err != nil {
		t.Fatalf("read roots.json: %v", err)
	}

	var entries []rootEntry
	if err := json.Unmarshal(data, &entries); err != nil {
		t.Fatalf("parse roots.json: %v", err)
	}

	roots := make(map[string]*x509.Certificate, len(entries))
	for _, entry := range entries {
		certs := parseCertificates(t, []byte(entry.PEM))
		if len(certs) != 1 {
			t.Fatalf("root %q has %d certificates, want 1", entry.Name, len(certs))
		}
		roots[entry.Name] = certs[0]
	}
	return roots
}

func loadImpactedIntermediates(t *testing.T) map[string]impactedIntermediate {
	t.Helper()

	data, err := os.ReadFile("testdata/impacted-intermediates.json")
	if err != nil {
		t.Fatalf("read impacted-intermediates.json: %v", err)
	}

	var entries []impactedIntermediate
	if err := json.Unmarshal(data, &entries); err != nil {
		t.Fatalf("parse impacted-intermediates.json: %v", err)
	}

	byHash := make(map[string]impactedIntermediate, len(entries))
	for _, entry := range entries {
		byHash[strings.ToLower(entry.SHA256)] = entry
	}
	return byHash
}

// verificationTime returns a timestamp inside every certificate's validity
// window, so a fixture that has since expired cannot make the test pass or
// fail for the wrong reason.
func verificationTime(t *testing.T, certs ...*x509.Certificate) time.Time {
	t.Helper()

	at := certs[0].NotBefore.Add(24 * time.Hour)
	if !at.Before(certs[0].NotAfter) {
		t.Fatalf("leaf has an empty validity window: %s - %s", certs[0].NotBefore, certs[0].NotAfter)
	}
	for _, cert := range certs[1:] {
		if at.Before(cert.NotBefore) || at.After(cert.NotAfter) {
			t.Fatalf("verification time %s is outside %q validity %s - %s",
				at, cert.Subject.CommonName, cert.NotBefore, cert.NotAfter)
		}
	}
	return at
}

func sha256Hex(data []byte) string {
	sum := sha256.Sum256(data)
	return hex.EncodeToString(sum[:])
}

func TestBlockedChainsAreRejected(t *testing.T) {
	roots := loadRoots(t)
	impacted := loadImpactedIntermediates(t)

	files, err := filepath.Glob("testdata/chains/*.pem")
	if err != nil {
		t.Fatalf("glob chains: %v", err)
	}
	if len(files) == 0 {
		t.Fatal("no chain fixtures found")
	}

	for _, file := range files {
		file := file
		name := strings.TrimSuffix(filepath.Base(file), ".pem")

		t.Run(name, func(t *testing.T) {
			certs := readCertificates(t, file)
			if len(certs) < 2 {
				t.Fatalf("%s: got %d certificates, want at least 2", file, len(certs))
			}

			leaf := certs[0]
			intermediates := certs[1:]

			// The served chain identifies which root the client must already
			// trust: the emSign path ends in a cross-signed intermediate,
			// while the Sectigo path ends directly at AAA Certificate Services.
			rootName := emSignRootName
			if strings.Contains(name, "-aaa-") {
				rootName = aaaRootName
			}
			root, ok := roots[rootName]
			if !ok {
				t.Fatalf("root %q is missing from roots.json", rootName)
			}

			at := verificationTime(t, append([]*x509.Certificate{leaf}, append(intermediates, root)...)...)

			// The fixture must really be the compromised intermediate we think
			// it is, not an unrelated chain that would fail verification
			// anyway.
			entry, ok := impacted[sha256Hex(intermediates[0].Raw)]
			if !ok {
				t.Fatalf("first intermediate %q does not match any entry in impacted-intermediates.json",
					intermediates[0].Subject.CommonName)
			}
			if entry.Usage != "tls" {
				t.Fatalf("intermediate %q has usage %q, want tls", entry.Name, entry.Usage)
			}

			rootPool := x509.NewCertPool()
			rootPool.AddCert(root)
			intermediatePool := x509.NewCertPool()
			for _, cert := range intermediates {
				intermediatePool.AddCert(cert)
			}

			chains, err := leaf.Verify(x509.VerifyOptions{
				Roots:         rootPool,
				Intermediates: intermediatePool,
				CurrentTime:   at,
				KeyUsages:     []x509.ExtKeyUsage{x509.ExtKeyUsageServerAuth},
			})
			if err == nil {
				t.Fatalf("verification succeeded with %d chain(s); the toolchain still trusts the compromised intermediate",
					len(chains))
			}
		})
	}
}

// TestControlChainVerifies guards against a harness that rejects everything,
// for example because of the wrong verification time or unparsable PEM.
func TestControlChainVerifies(t *testing.T) {
	chain := readCertificates(t, "testdata/control/le-chain.pem")
	if len(chain) < 2 {
		t.Fatalf("control chain has %d certificates, want at least 2", len(chain))
	}

	root := readCertificates(t, "testdata/control/isrg-root-x1.pem")[0]
	leaf := chain[0]
	intermediates := chain[1:]

	at := verificationTime(t, append([]*x509.Certificate{leaf}, append(intermediates, root)...)...)

	rootPool := x509.NewCertPool()
	rootPool.AddCert(root)
	intermediatePool := x509.NewCertPool()
	for _, cert := range intermediates {
		intermediatePool.AddCert(cert)
	}

	chains, err := leaf.Verify(x509.VerifyOptions{
		Roots:         rootPool,
		Intermediates: intermediatePool,
		CurrentTime:   at,
		KeyUsages:     []x509.ExtKeyUsage{x509.ExtKeyUsageServerAuth},
	})
	if err != nil {
		t.Fatalf("control chain must verify: %v", err)
	}
	if len(chains) == 0 {
		t.Fatal("control chain produced no verified chains")
	}
}

// TestToolchainHasDistrustList makes the build-provenance requirement explicit
// for anyone running these tests with an older local Go.
func TestToolchainHasDistrustList(t *testing.T) {
	version := runtime.Version()
	major, minor, patch, ok := parseGoVersion(version)
	if !ok {
		t.Fatalf("could not parse Go toolchain version %q", version)
	}

	wantMajor, wantMinor, wantPatch, _ := parseGoVersion(minGoVersion)
	if versionLess(major, minor, patch, wantMajor, wantMinor, wantPatch) {
		t.Fatalf("go %s does not contain the eMudhra distrusted-certificate list; need %s or newer",
			version, minGoVersion)
	}
}

func parseGoVersion(version string) (major, minor, patch int, ok bool) {
	version = strings.TrimPrefix(version, "go")
	version = strings.TrimPrefix(version, "devel ")
	parts := strings.Split(version, ".")
	if len(parts) < 2 {
		return 0, 0, 0, false
	}

	parse := func(s string) (int, bool) {
		n, err := strconv.Atoi(s)
		return n, err == nil
	}

	major, ok = parse(parts[0])
	if !ok {
		return 0, 0, 0, false
	}
	minorText := parts[1]
	if i := strings.IndexAny(minorText, "rc-"); i >= 0 {
		minorText = minorText[:i]
	}
	minor, ok = parse(minorText)
	if !ok {
		return 0, 0, 0, false
	}
	if len(parts) > 2 {
		patchText := parts[2]
		if i := strings.IndexAny(patchText, "rc-"); i >= 0 {
			patchText = patchText[:i]
		}
		patch, _ = parse(patchText)
	}
	return major, minor, patch, true
}

func versionLess(major, minor, patch, wantMajor, wantMinor, wantPatch int) bool {
	if major != wantMajor {
		return major < wantMajor
	}
	if minor != wantMinor {
		return minor < wantMinor
	}
	return patch < wantPatch
}
