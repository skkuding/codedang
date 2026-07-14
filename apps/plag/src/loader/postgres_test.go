package loader

import (
	"context"
	"os"
	"testing"
	"time"
)

func TestParseDatabaseURL(t *testing.T) {
	tests := []struct {
		name    string
		input   string
		want    string
		wantErr bool
	}{
		{
			name:  "loopback IPv4 defaults to disabled SSL",
			input: "postgresql://user:pass@127.0.0.1:5432/db?schema=public&application_name=plag",
			want:  "postgresql://user:pass@127.0.0.1:5432/db?application_name=plag&sslmode=disable",
		},
		{
			name:  "loopback IPv6 defaults to disabled SSL",
			input: "postgresql://user:pass@[::1]:5432/db",
			want:  "postgresql://user:pass@[::1]:5432/db?sslmode=disable",
		},
		{
			name:  "remote host defaults to disabled SSL",
			input: "postgresql://user:pass@db.internal:5432/db?schema=public",
			want:  "postgresql://user:pass@db.internal:5432/db?sslmode=disable",
		},
		{
			name:    "unsupported prefer mode is rejected",
			input:   "postgres://user:pass@10.0.0.2:5432/db?sslmode=prefer",
			wantErr: true,
		},
		{
			name:  "explicit disable is preserved",
			input: "postgresql://user:pass@db.internal:5432/db?schema=public&sslmode=disable",
			want:  "postgresql://user:pass@db.internal:5432/db?sslmode=disable",
		},
		{
			name:  "explicit require is preserved",
			input: "postgresql://user:pass@127.0.0.1:5432/db?sslmode=require",
			want:  "postgresql://user:pass@127.0.0.1:5432/db?sslmode=require",
		},
		{
			name:  "explicit verify-ca is preserved",
			input: "postgresql://user:pass@db.internal:5432/db?sslmode=verify-ca",
			want:  "postgresql://user:pass@db.internal:5432/db?sslmode=verify-ca",
		},
		{
			name:  "explicit verify-full is preserved",
			input: "postgresql://user:pass@db.internal:5432/db?sslmode=verify-full",
			want:  "postgresql://user:pass@db.internal:5432/db?sslmode=verify-full",
		},
		{
			name:    "non-PostgreSQL scheme is rejected",
			input:   "mysql://user:pass@localhost:3306/db",
			wantErr: true,
		},
		{
			name:    "unsupported SSL mode is rejected",
			input:   "postgresql://user:pass@db.internal:5432/db?sslmode=allow",
			wantErr: true,
		},
		{
			name:    "malformed query is rejected",
			input:   "postgresql://user:pass@db.internal:5432/db?schema=%zz",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := parseDatabaseURL(tt.input)
			if (err != nil) != tt.wantErr {
				t.Fatalf("parseDatabaseURL() error = %v, wantErr %v", err, tt.wantErr)
			}
			if got != tt.want {
				t.Errorf("parseDatabaseURL() = %q, want %q", got, tt.want)
			}
		})
	}
}

func TestPostgresConnection(t *testing.T) {
	databaseURL := os.Getenv("POSTGRES_INTEGRATION_URL")
	if databaseURL == "" {
		t.Skip("POSTGRES_INTEGRATION_URL is not set")
	}

	t.Setenv("DATABASE_URL", databaseURL)
	postgres, err := NewPostgresDataSource(context.Background())
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = postgres.client.Close() })

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := postgres.client.PingContext(ctx); err != nil {
		t.Fatalf("connect to PostgreSQL: %v", err)
	}
}
