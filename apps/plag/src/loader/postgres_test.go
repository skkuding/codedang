package loader

import (
	"database/sql"
	"errors"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/require"
)

func newPostgresGetTest(t *testing.T) (*Postgres, sqlmock.Sqlmock) {
	t.Helper()
	db, mock, err := sqlmock.New(sqlmock.QueryMatcherOption(sqlmock.QueryMatcherEqual))
	require.NoError(t, err)
	t.Cleanup(func() { _ = db.Close() })
	t.Cleanup(func() {
		require.NoError(t, mock.ExpectationsWereMet())
	})
	return &Postgres{client: db}, mock
}

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
			if tt.wantErr {
				require.Error(t, err)
			} else {
				require.NoError(t, err)
			}
			require.Equal(t, tt.want, got)
		})
	}
}

func TestPostgresGetAllCodesFromAssignments(t *testing.T) {
	const query = `SELECT DISTINCT ON (user_id, assignment_id) id, user_id, COALESCE(to_jsonb(code), '[]'::jsonb), create_time
		FROM public.submission
		WHERE problem_id = $1 AND language = $2 AND assignment_id = ANY($3::INT4[])
		ORDER BY user_id, assignment_id, update_time DESC;`
	const baseCodeQuery = `SELECT COALESCE(to_jsonb(template), '[]'::jsonb) FROM public.problem WHERE id = $1`
	const code = `[{"text":"print("},{"text":"1)\n"}]`
	const template = `["[{\"language\":\"Java\",\"code\":[{\"text\":\"ignored\"}]},{\"language\":\"Python3\",\"code\":[{\"text\":\"# base\"},{\"text\":\"\\n\"}]}]"]`

	queryErr := errors.New("query failed")
	baseCodeErr := errors.New("base code query failed")
	wantCodes := []Element{
		{Id: 10, UserId: 100, Code: "print(1)\n", CreateTime: "2026-11-01 12:00:00"},
		{Id: 20, UserId: 200, Code: "print(2)\n", CreateTime: "2026-11-02 12:00:00"},
	}
	tests := []struct {
		name         string
		rowCount     int
		firstID      any
		firstCode    string
		secondUserID int
		template     string
		queryErr     error
		baseCodeErr  error
		wantBaseCode string
		wantErr      string
		wantCause    error
	}{
		{
			name: "codes and matching language template", rowCount: 2,
			firstID: 10, firstCode: code, template: template, wantBaseCode: "# base\n",
		},
		{
			name: "empty template", rowCount: 2,
			firstID: 10, firstCode: code, template: `[]`,
		},
		{
			name: "no matching template language", rowCount: 2,
			firstID: 10, firstCode: code,
			template: `["[{\"language\":\"Java\",\"code\":[{\"text\":\"ignored\"}]}]"]`,
		},
		{
			name: "no problem row", rowCount: 2,
			firstID: 10, firstCode: code, baseCodeErr: sql.ErrNoRows,
		},
		{
			name: "submission query error", queryErr: queryErr,
			wantErr: "failed to get data: query failed", wantCause: queryErr,
		},
		{
			name:    "no submissions",
			wantErr: "failed to get data: not enough submissions found for problemId: 42, submissionCount: 0",
		},
		{
			name: "one submission", rowCount: 1, firstID: 10, firstCode: code,
			wantErr: "failed to get data: not enough submissions found for problemId: 42, submissionCount: 1",
		},
		{
			name: "scan error", rowCount: 2, firstID: "not-an-int", firstCode: code,
			wantErr: "failed to get data: database fetch error:",
		},
		{
			name: "code too short", rowCount: 2, firstID: 10, firstCode: `[]`,
			wantErr: "failed to get data: code length error: json is too short",
		},
		{
			name: "invalid code JSON", rowCount: 2, firstID: 10, firstCode: `invalid`,
			wantErr: "failed to get data: json unmarshal:",
		},
		{
			name: "base code query error", rowCount: 2, firstID: 10, firstCode: code,
			baseCodeErr: baseCodeErr, wantCause: baseCodeErr,
			wantErr: "failed to get data: database fetch error: base code query failed",
		},
		{
			name: "invalid template JSON", rowCount: 2, firstID: 10, firstCode: code,
			template: `invalid`, wantErr: "failed to get data: inner json unmarshal:",
		},
		{
			name: "invalid nested template JSON", rowCount: 2, firstID: 10, firstCode: code,
			template: `["invalid"]`, wantErr: "failed to get data: outer json unmarshal:",
		},
		{
			name:         "same user across different assignments",
			rowCount:     2,
			firstID:      10,
			firstCode:    code,
			secondUserID: 100,
			template:     template,
			wantBaseCode: "# base\n",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			p, mock := newPostgresGetTest(t)
			expect := mock.ExpectQuery(query).WithArgs("42", "Python3", `{"1","2"}`)
			if tt.queryErr != nil {
				expect.WillReturnError(tt.queryErr)
			} else {
				rows := sqlmock.NewRows([]string{"id", "user_id", "code", "create_time"})
				if tt.rowCount > 0 {
					rows.AddRow(tt.firstID, 100, tt.firstCode, wantCodes[0].CreateTime)
				}
				if tt.rowCount > 1 {
					userID := 200
					if tt.secondUserID != 0 {
						userID = tt.secondUserID
					}

					rows.AddRow(
						20,
						userID,
						`[{"text":"print(2)\n"}]`,
						wantCodes[1].CreateTime,
					)
				}
				expect.WillReturnRows(rows).RowsWillBeClosed()
			}
			if tt.template != "" || tt.baseCodeErr != nil {
				expectBaseCode := mock.ExpectQuery(baseCodeQuery).WithArgs("42")
				if tt.baseCodeErr != nil {
					expectBaseCode.WillReturnError(tt.baseCodeErr)
				} else {
					expectBaseCode.WillReturnRows(sqlmock.NewRows([]string{"template"}).AddRow(tt.template)).RowsWillBeClosed()
				}
			}

			baseCode, codes, err := p.GetAllCodesFromAssignments("42", "Python3", []string{"1", "2"})

			if tt.wantErr != "" {
				require.ErrorContains(t, err, tt.wantErr)
				if tt.wantCause != nil {
					require.ErrorIs(t, err, tt.wantCause)
				}
				require.Empty(t, baseCode)
				require.Nil(t, codes)
				return
			}
			require.NoError(t, err)
			require.Equal(t, tt.wantBaseCode, baseCode)

			expectedCodes := append([]Element(nil), wantCodes...)

			if tt.secondUserID != 0 {
				expectedCodes[1].UserId = tt.secondUserID
			}

			require.Equal(t, expectedCodes, codes)
		})
	}
}
