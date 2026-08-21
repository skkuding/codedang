package loader

import (
	"context"
	"database/sql"
	"fmt"
	"net/url"
	"os"

	_ "github.com/lib/pq"
)

type Postgres struct {
	ctx    context.Context
	client *sql.DB
}

func NewPostgresDataSource(ctx context.Context) (*Postgres, error) {
	// 새로운 ENV 추가 필요
	connStr := os.Getenv("DATABASE_URL")
	data, err := parseDatabaseURL(connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to access database: %w", err)
	}

	db, err := sql.Open("postgres", data)

	if err != nil {
		return nil, fmt.Errorf("failed to access database: %w", err)
	}

	return &Postgres{ctx, db}, nil
}

func parseDatabaseURL(databaseURL string) (string, error) {
	parsed, err := url.Parse(databaseURL)
	if err != nil {
		return "", fmt.Errorf("invalid database URL: %w", err)
	}
	if parsed.Scheme != "postgres" && parsed.Scheme != "postgresql" {
		return "", fmt.Errorf("invalid database URL scheme %q", parsed.Scheme)
	}

	query, err := url.ParseQuery(parsed.RawQuery)
	if err != nil {
		return "", fmt.Errorf("invalid database URL query: %w", err)
	}
	query.Del("schema")
	switch sslMode := query.Get("sslmode"); sslMode {
	case "":
		query.Set("sslmode", "disable")
	case "disable", "require", "verify-ca", "verify-full":
	default:
		return "", fmt.Errorf("unsupported sslmode %q", sslMode)
	}

	parsed.RawQuery = query.Encode()
	return parsed.String(), nil
}

func (p *Postgres) Get(key string) ([]Element, error) {
	rows, err := p.client.Query(`
  SELECT id, input, output, is_hidden_testcase
  FROM public.problem_testcase
  WHERE problem_id = $1 AND is_outdated = false
  `, key)
	if err != nil {
		return nil, fmt.Errorf("failed to get key: %w", err)
	}

	defer rows.Close()

	var result []Element

	for rows.Next() {
		var id int
		var input string
		var output string
		var is_hidden_testacase bool

		if err := rows.Scan(&id, &input, &output, &is_hidden_testacase); err != nil {
			return nil, fmt.Errorf("database fetch error: %w", err)
		}

		result = append(result, Element{
			Id:     id,
			In:     input,
			Out:    output,
			Hidden: is_hidden_testacase,
		})
	}

	if len(result) == 0 {
		return nil, fmt.Errorf("no testcase found for problemId: %s", key)
	}

	return result, nil
}
