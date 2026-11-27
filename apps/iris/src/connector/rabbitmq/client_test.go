package rabbitmq

import (
	"bytes"
	"crypto/tls"
	"crypto/x509"
	"errors"
	"reflect"
	"slices"
	"testing"

	amqp "github.com/rabbitmq/amqp091-go"
)

func TestNewAMQPConfig(t *testing.T) {
	const connectionName = "test-connection"
	certificateBytes := []byte("stub certificate bytes")
	readErr := errors.New("file read failed")

	tests := []struct {
		name      string
		ssl       string
		readErr   error
		appendOK  bool
		wantCalls []string
		wantTLS   bool
		wantError string
	}{
		{
			name: "ssl_disabled", ssl: "false",
			wantCalls: []string{"getenv"},
		},
		{
			name: "ssl_enabled_success", ssl: "true", appendOK: true,
			wantCalls: []string{"getenv", "readFile", "newCertPool", "appendCerts"}, wantTLS: true,
		},
		{
			name: "certificate_read_failure", ssl: "true", readErr: readErr,
			wantCalls: []string{"getenv", "readFile"}, wantError: "read RabbitMQ CA certificate: file read failed",
		},
		{
			name: "certificate_parse_failure", ssl: "true",
			wantCalls: []string{"getenv", "readFile", "newCertPool", "appendCerts"},
			wantError: "parse RabbitMQ CA certificate",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var calls []string
			// Used only for reference identity, not real certificate parsing.
			pool := &x509.CertPool{}
			deps := amqpConfigDeps{
				getenv: func(key string) string {
					calls = append(calls, "getenv")
					if key != "RABBITMQ_SSL" {
						t.Fatalf("getenv key = %q, want RABBITMQ_SSL", key)
					}
					return tt.ssl
				},
				readFile: func(path string) ([]byte, error) {
					calls = append(calls, "readFile")
					if path != "/etc/codedang/certs/ca.crt" {
						t.Fatalf("certificate path = %q", path)
					}
					if tt.readErr != nil {
						return nil, tt.readErr
					}
					return bytes.Clone(certificateBytes), nil
				},
				newCertPool: func() *x509.CertPool {
					calls = append(calls, "newCertPool")
					return pool
				},
				appendCerts: func(gotPool *x509.CertPool, pem []byte) bool {
					calls = append(calls, "appendCerts")
					if gotPool != pool || !bytes.Equal(pem, certificateBytes) {
						t.Fatal("appendCerts must receive the created pool and certificate bytes")
					}
					return tt.appendOK
				},
			}

			got, err := newAMQPConfigWithDeps(connectionName, deps)
			if !slices.Equal(calls, tt.wantCalls) {
				t.Fatalf("calls = %v, want %v", calls, tt.wantCalls)
			}
			if tt.wantError != "" {
				if err == nil || err.Error() != tt.wantError {
					t.Fatalf("error = %v, want %q", err, tt.wantError)
				}
				if tt.readErr != nil && !errors.Is(err, tt.readErr) {
					t.Fatalf("error must wrap the file read error: %v", err)
				}
				if !reflect.DeepEqual(got, amqp.Config{}) {
					t.Fatalf("config = %+v, want zero config", got)
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if got.Properties["connection_name"] != connectionName {
				t.Fatalf("connection name = %v, want %q", got.Properties["connection_name"], connectionName)
			}
			if !tt.wantTLS {
				if got.TLSClientConfig != nil {
					t.Fatal("TLS configuration must be nil when SSL is disabled")
				}
				return
			}
			if got.TLSClientConfig == nil {
				t.Fatal("TLS configuration must be initialized")
			}
			if got.TLSClientConfig.RootCAs != pool || got.TLSClientConfig.MinVersion != tls.VersionTLS12 {
				t.Fatal("TLS configuration must preserve the pool and require TLS 1.2 or later")
			}
		})
	}
}
