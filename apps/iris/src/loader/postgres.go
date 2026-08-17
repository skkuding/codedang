package loader

import (
	"context"
	"database/sql"
	"fmt"
	"net/url"
	"os"
	"time"

	_ "github.com/lib/pq"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
)

type Postgres struct {
	ctx    context.Context
	client *sql.DB
	logger logger.Logger
}

func NewPostgresDataSource(ctx context.Context, logProvider logger.Logger) (*Postgres, error) {
	connStr := os.Getenv("DATABASE_URL")
	data, err := parseDatabaseURL(connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to access database: %w", err)
	}
	db, err := sql.Open("postgres", data)

	if err != nil {
		return nil, fmt.Errorf("failed to access database: %w", err)
	}

	return &Postgres{ctx: ctx, client: db, logger: logProvider}, nil
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

// todo: need to introduce prisma like ORM
func (p *Postgres) Save(elements []ElementIn) error {
	const insertQuery = `INSERT INTO public.problem_testcase
		(problem_id, input, output, is_hidden_testcase, update_time)
		VALUES ($1, $2, $3, $4, NOW())`
	start := time.Now()
	p.logger.Log(
		logger.INFO,
		fmt.Sprintf("sql.save.start query=%q items=%d", insertQuery, len(elements)),
	)
	if len(elements) == 0 {
		p.logger.Log(logger.WARN, "sql.save.skip reason=empty_elements")
		return nil
	}

	tx, err := p.client.BeginTx(p.ctx, nil)
	if err != nil {
		p.logger.Log(logger.ERROR, fmt.Sprintf("sql.save.failed stage=begin_tx err=%v", err))
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback() //nolint:errcheck

	stmt, err := tx.PrepareContext(p.ctx, insertQuery)
	if err != nil {
		p.logger.Log(logger.ERROR, fmt.Sprintf("sql.save.failed stage=prepare err=%v", err))
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	for idx, element := range elements {
		p.logger.Log(
			logger.DEBUG,
			fmt.Sprintf(
				"sql.save.exec.start index=%d problem_id=%s testcase_id=%d hidden=%t input_len=%d output_len=%d",
				idx,
				element.ProblemId,
				element.Id,
				element.Hidden,
				len(element.In),
				len(element.Out),
			),
		)
		res, err := stmt.ExecContext(p.ctx, element.ProblemId, element.In, element.Out, element.Hidden)
		if err != nil {
			p.logger.Log(logger.ERROR, fmt.Sprintf("sql.save.failed stage=exec index=%d err=%v", idx, err))
			return fmt.Errorf("failed to save testcase: %w", err)
		}
		affected, affectedErr := res.RowsAffected()
		if affectedErr != nil {
			p.logger.Log(
				logger.WARN,
				fmt.Sprintf("sql.save.exec.done index=%d rows_affected=unknown err=%v", idx, affectedErr),
			)
		} else {
			p.logger.Log(
				logger.DEBUG,
				fmt.Sprintf("sql.save.exec.done index=%d rows_affected=%d", idx, affected),
			)
		}
	}

	if err := tx.Commit(); err != nil {
		p.logger.Log(logger.ERROR, fmt.Sprintf("sql.save.failed stage=commit err=%v", err))
		return fmt.Errorf("failed to commit transaction: %w", err)
	}
	p.logger.Log(
		logger.INFO,
		fmt.Sprintf("sql.save.done inserted=%d duration=%s", len(elements), time.Since(start)),
	)
	return nil
}

func (p *Postgres) Get(key string) ([]ElementOut, error) {
	const selectQuery = `
  SELECT id, input, output, is_hidden_testcase
  FROM public.problem_testcase
  WHERE problem_id = $1 AND is_outdated = false
  `
	start := time.Now()
	p.logger.Log(
		logger.INFO,
		fmt.Sprintf("sql.get.start query=%q problem_id=%s", selectQuery, key),
	)

	rows, err := p.client.Query(selectQuery, key)
	if err != nil {
		p.logger.Log(
			logger.ERROR,
			fmt.Sprintf("sql.get.failed stage=query problem_id=%s err=%v", key, err),
		)
		return nil, fmt.Errorf("failed to get key: %w", err)
	}

	defer rows.Close()

	var result []ElementOut

	for rows.Next() {
		var id int
		var input string
		var output string
		var isHiddenTestcase bool

		if err := rows.Scan(&id, &input, &output, &isHiddenTestcase); err != nil {
			p.logger.Log(
				logger.ERROR,
				fmt.Sprintf("sql.get.failed stage=scan problem_id=%s err=%v", key, err),
			)
			return nil, fmt.Errorf("database fetch error: %w", err)
		}

		result = append(result, ElementOut{
			Id:     id,
			In:     input,
			Out:    output,
			Hidden: isHiddenTestcase,
		})
	}

	if len(result) == 0 {
		p.logger.Log(
			logger.WARN,
			fmt.Sprintf("sql.get.done problem_id=%s rows=0 duration=%s", key, time.Since(start)),
		)
		return nil, fmt.Errorf("no testcase found for problemId: %s", key)
	}

	p.logger.Log(
		logger.INFO,
		fmt.Sprintf("sql.get.done problem_id=%s rows=%d duration=%s", key, len(result), time.Since(start)),
	)

	return result, nil
}
