package rabbitmq

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/tls"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/pem"
	"math/big"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

func TestNewAMQPConfigWithoutTLS(t *testing.T) {
	config, err := newAMQPConfig("consumer", TLSConfig{})
	if err != nil {
		t.Fatal(err)
	}
	if config.TLSClientConfig != nil {
		t.Fatal("TLS config was set while TLS is disabled")
	}
	if got := config.Properties["connection_name"]; got != "consumer" {
		t.Fatalf("connection name = %v, want consumer", got)
	}
}

func TestNewAMQPConfigRejectsUnreadableOrInvalidCA(t *testing.T) {
	t.Run("missing file", func(t *testing.T) {
		_, err := newAMQPConfig("consumer", TLSConfig{Enabled: true, CAPath: filepath.Join(t.TempDir(), "missing.pem")})
		if err == nil || !strings.Contains(err.Error(), "read RabbitMQ CA certificate") {
			t.Fatalf("unexpected error: %v", err)
		}
	})

	t.Run("invalid PEM", func(t *testing.T) {
		path := filepath.Join(t.TempDir(), "ca.pem")
		if err := os.WriteFile(path, []byte("not a certificate"), 0600); err != nil {
			t.Fatal(err)
		}
		_, err := newAMQPConfig("consumer", TLSConfig{Enabled: true, CAPath: path})
		if err == nil || err.Error() != "parse RabbitMQ CA certificate" {
			t.Fatalf("unexpected error: %v", err)
		}
	})
}

func TestNewAMQPConfigLoadsCA(t *testing.T) {
	key, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		t.Fatal(err)
	}
	serial, err := rand.Int(rand.Reader, new(big.Int).Lsh(big.NewInt(1), 128))
	if err != nil {
		t.Fatal(err)
	}
	template := &x509.Certificate{
		SerialNumber:          serial,
		Subject:               pkix.Name{CommonName: "test CA"},
		NotBefore:             time.Now().Add(-time.Hour),
		NotAfter:              time.Now().Add(time.Hour),
		IsCA:                  true,
		BasicConstraintsValid: true,
		KeyUsage:              x509.KeyUsageCertSign,
	}
	certificate, err := x509.CreateCertificate(rand.Reader, template, template, &key.PublicKey, key)
	if err != nil {
		t.Fatal(err)
	}
	path := filepath.Join(t.TempDir(), "ca.pem")
	if err := os.WriteFile(path, pem.EncodeToMemory(&pem.Block{Type: "CERTIFICATE", Bytes: certificate}), 0600); err != nil {
		t.Fatal(err)
	}

	config, err := newAMQPConfig("consumer", TLSConfig{Enabled: true, CAPath: path})
	if err != nil {
		t.Fatal(err)
	}
	if config.TLSClientConfig == nil || config.TLSClientConfig.MinVersion != tls.VersionTLS12 {
		t.Fatalf("unexpected TLS config: %+v", config.TLSClientConfig)
	}
	if got := len(config.TLSClientConfig.RootCAs.Subjects()); got != 1 {
		t.Fatalf("CA subjects = %d, want 1", got)
	}
}
