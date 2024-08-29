package postgres

import (
	"context"
	"database/sql"
	"fmt"
	"strconv"

	_ "github.com/lib/pq"
	"github.com/skkuding/codedang/apps/iris/src/loader"
)

type postgres struct {
	ctx    context.Context
	client *sql.DB
}

func NewPostgresDataSource(ctx context.Context) *postgres {
	connStr := "postgresql://postgres:1234@127.0.0.1:5433/skkuding?sslmode=disable"
	db, err := sql.Open("postgres", connStr)

	if err != nil {
		panic(fmt.Errorf("cannot access database: %w", err))
	}

	return &postgres{ctx, db}
}

func (p *postgres) Get(key string) ([]loader.Element, error) {
	// logProvider := logger.NewLogger(logger.Console, false)

	rows, err := p.client.Query(`SELECT id, input, output FROM public.problem_testcase WHERE problem_id = $1`, key)
	if err != nil {
		return nil, fmt.Errorf("failed to get key: %w", err)
	}

	defer rows.Close()

	var result []loader.Element

	for rows.Next() {
		var id int
		var input string
		var output string

		if err := rows.Scan(&id, &input, &output); err != nil {
			return nil, fmt.Errorf("database fetch error: %w", err)
		}

		result = append(result, loader.Element{
			Id:  strconv.Itoa(id),
			In:  input,
			Out: output,
		})
	}

	if len(result) == 0 {
		return nil, fmt.Errorf("no testcase found for problemId: %s", key)
	}

	return result, nil
}
