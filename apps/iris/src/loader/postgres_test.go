package loader

import (
	"context"
	"errors"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
	"github.com/stretchr/testify/require"
)

type noopLogger struct{}

func (noopLogger) Log(logger.Level, string)                             {}
func (noopLogger) LogWithContext(logger.Level, string, context.Context) {}
func (noopLogger) Panic(msg string)                                     { panic(msg) }

func newPostgresGetTest(t *testing.T) (*Postgres, sqlmock.Sqlmock) {
	t.Helper()
	db, mock, err := sqlmock.New(
		sqlmock.QueryMatcherOption(sqlmock.QueryMatcherEqual),
	)
	require.NoError(t, err)
	t.Cleanup(func() { _ = db.Close() })
	t.Cleanup(func() {
		require.NoError(t, mock.ExpectationsWereMet())
	})

	return &Postgres{client: db, logger: noopLogger{}}, mock
}

const postgresGetAllQuery = `
	SELECT id, input, output, is_hidden_testcase
	FROM public.problem_testcase
	WHERE problem_id = $1 AND is_outdated = false
	ORDER BY is_hidden_testcase, id
`

func TestParseDatabaseURL(t *testing.T) {
	tests := []struct {
		name    string
		input   string
		want    string
		wantErr bool
	}{
		{
			name:  "loopback IPv4 defaults to disabled SSL",
			input: "postgresql://user:pass@127.0.0.1:5432/db?schema=public&application_name=iris",
			want:  "postgresql://user:pass@127.0.0.1:5432/db?application_name=iris&sslmode=disable",
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

func TestPostgresGet_All(t *testing.T) {
	db, mock, err := sqlmock.New(
		sqlmock.QueryMatcherOption(sqlmock.QueryMatcherEqual),
	)
	require.NoError(t, err)
	defer db.Close()

	p := &Postgres{
		client: db,
		logger: noopLogger{},
	}

	const query = `
		SELECT id, input, output, is_hidden_testcase
		FROM public.problem_testcase
		WHERE problem_id = $1 AND is_outdated = false
		ORDER BY is_hidden_testcase, id
	`

	rows := sqlmock.NewRows([]string{
		"id", "input", "output", "is_hidden_testcase",
	}).
		AddRow(10, "1 2\n", "3\n", false).
		AddRow(20, "3 4\n", "7\n", true)

	mock.ExpectQuery(query).
		WithArgs("42").
		WillReturnRows(rows).
		RowsWillBeClosed()

	got, err := p.Get(context.Background(), "42", ALL)

	require.NoError(t, err)
	require.Equal(t, []ElementOut{
		{Id: 10, In: "1 2\n", Out: "3\n", Hidden: false},
		{Id: 20, In: "3 4\n", Out: "7\n", Hidden: true},
	}, got)
	require.NoError(t, mock.ExpectationsWereMet())
}

func TestPostgresGet_PUBLIC_ONLY(t *testing.T) {
	db, mock, err := sqlmock.New(
		sqlmock.QueryMatcherOption(sqlmock.QueryMatcherEqual),
	)
	require.NoError(t, err)
	defer db.Close()

	p := &Postgres{
		client: db,
		logger: noopLogger{},
	}

	const query = `
		SELECT id, input, output, is_hidden_testcase
		FROM public.problem_testcase
		WHERE problem_id = $1 AND is_outdated = false AND is_hidden_testcase = false
		ORDER BY is_hidden_testcase, id
	`
	rows := sqlmock.NewRows([]string{
		"id", "input", "output", "is_hidden_testcase",
	}).
		AddRow(10, "1 2\n", "3\n", false)

	mock.ExpectQuery(query).
		WithArgs("42").
		WillReturnRows(rows).
		RowsWillBeClosed()

	got, err := p.Get(context.Background(), "42", PUBLIC_ONLY)

	require.NoError(t, err)
	require.Equal(t, []ElementOut{
		{Id: 10, In: "1 2\n", Out: "3\n", Hidden: false},
	}, got)
	require.NoError(t, mock.ExpectationsWereMet())
}

func TestPostgresGet_HIDDEN_ONLY(t *testing.T) {
	db, mock, err := sqlmock.New(
		sqlmock.QueryMatcherOption(sqlmock.QueryMatcherEqual),
	)
	require.NoError(t, err)
	defer db.Close()

	p := &Postgres{
		client: db,
		logger: noopLogger{},
	}

	const query = `
		SELECT id, input, output, is_hidden_testcase
		FROM public.problem_testcase
		WHERE problem_id = $1 AND is_outdated = false AND is_hidden_testcase = true
		ORDER BY is_hidden_testcase, id
	`
	rows := sqlmock.NewRows([]string{
		"id", "input", "output", "is_hidden_testcase",
	}).
		AddRow(20, "3 4\n", "7\n", true)

	mock.ExpectQuery(query).
		WithArgs("42").
		WillReturnRows(rows).
		RowsWillBeClosed()

	got, err := p.Get(context.Background(), "42", HIDDEN_ONLY)

	require.NoError(t, err)
	require.Equal(t, []ElementOut{
		{Id: 20, In: "3 4\n", Out: "7\n", Hidden: true},
	}, got)
	require.NoError(t, mock.ExpectationsWereMet())
}

func TestPostgresGet_Invalid_EType(t *testing.T) {
	p, _ := newPostgresGetTest(t)

	got, err := p.Get(context.Background(), "42", ElementType(3))

	require.EqualError(t, err, "invalid element type: 3")
	require.Nil(t, got)
}

func TestPostgresGet_NoRows(t *testing.T) {
	p, mock := newPostgresGetTest(t)
	rows := sqlmock.NewRows([]string{
		"id", "input", "output", "is_hidden_testcase",
	})
	mock.ExpectQuery(postgresGetAllQuery).
		WithArgs("42").
		WillReturnRows(rows).
		RowsWillBeClosed()

	got, err := p.Get(context.Background(), "42", ALL)

	require.EqualError(t, err, "no testcase found for problemId: 42")
	require.Nil(t, got)
}

func TestPostgresGet_QueryError(t *testing.T) {
	p, mock := newPostgresGetTest(t)
	wantErr := errors.New("query failed")
	mock.ExpectQuery(postgresGetAllQuery).
		WithArgs("42").
		WillReturnError(wantErr)

	got, err := p.Get(context.Background(), "42", ALL)

	require.ErrorIs(t, err, wantErr)
	require.EqualError(t, err, "failed to get key: query failed")
	require.Nil(t, got)
}

func TestPostgresGet_ScanError(t *testing.T) {
	p, mock := newPostgresGetTest(t)
	rows := sqlmock.NewRows([]string{
		"id", "input", "output", "is_hidden_testcase",
	}).
		AddRow(10, "1 2\n", "3\n", false).
		AddRow("not-an-int", "3 4\n", "7\n", true)
	mock.ExpectQuery(postgresGetAllQuery).
		WithArgs("42").
		WillReturnRows(rows).
		RowsWillBeClosed()

	got, err := p.Get(context.Background(), "42", ALL)

	require.ErrorContains(t, err, "database fetch error:")
	require.ErrorContains(t, err, "not-an-int")
	require.Nil(t, got)
}

func TestPostgresGet_IterationError(t *testing.T) {
	p, mock := newPostgresGetTest(t)
	wantErr := errors.New("row iteration failed")
	rows := sqlmock.NewRows([]string{
		"id", "input", "output", "is_hidden_testcase",
	}).
		AddRow(10, "1 2\n", "3\n", false).
		AddRow(20, "3 4\n", "7\n", true).
		RowError(1, wantErr)
	mock.ExpectQuery(postgresGetAllQuery).
		WithArgs("42").
		WillReturnRows(rows).
		RowsWillBeClosed()

	got, err := p.Get(context.Background(), "42", ALL)

	require.ErrorIs(t, err, wantErr)
	require.EqualError(t, err, "database fetch error: row iteration failed")
	require.Nil(t, got)
}
