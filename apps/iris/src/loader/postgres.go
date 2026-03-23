package loader

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"strings"

	_ "github.com/lib/pq"
)

type Postgres struct {
	ctx    context.Context
	client *sql.DB
}

func NewPostgresDataSource(ctx context.Context) (*Postgres, error) {
	// 새로운 ENV 추가 필요
	connStr := os.Getenv("DATABASE_URL")
	data := strings.Replace(connStr, "schema=public", "sslmode=disable", 1)
	db, err := sql.Open("postgres", data)

	if err != nil {
		return nil, fmt.Errorf("failed to access database: %w", err)
	}

	return &Postgres{ctx, db}, nil
}

// todo: need to introduce prisma like ORM
func (p *Postgres) Save(elements []ElementIn) error {
	script := "INSERT INTO public.problem_testcase (problem_id, input, output, is_hidden_testcase) VALUES "
	for _, element := range elements {
		script += fmt.Sprintf(`(%d, '%s', '%s', %t),`, element.Id, element.In, element.Out, element.Hidden)
	}
	script = strings.TrimSuffix(script, ",")

	_, err := p.client.Exec(script)
	if err != nil {
		return fmt.Errorf("failed to save testcase: %w", err)
	}

	return nil
}

func (p *Postgres) Get(key string) ([]ElementOut, error) {
	rows, err := p.client.Query(`
  SELECT id, input, output, is_hidden_testcase
  FROM public.problem_testcase
  WHERE problem_id = $1 AND is_outdated = false
  `, key)
	if err != nil {
		return nil, fmt.Errorf("failed to get key: %w", err)
	}

	defer rows.Close()

	var result []ElementOut

	for rows.Next() {
		var id int
		var input string
		var output string
		var is_hidden_testacase bool

		if err := rows.Scan(&id, &input, &output, &is_hidden_testacase); err != nil {
			return nil, fmt.Errorf("database fetch error: %w", err)
		}

		result = append(result, ElementOut{
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
