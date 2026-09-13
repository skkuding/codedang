package loader

import (
	"context"
	"database/sql"
	"fmt"
	"net/url"
	"os"
	"strconv"
	"time"

	"github.com/skkuding/codedang/apps/iris/src/service/logger"
)

type Postgres struct {
	client *sql.DB
	logger logger.Logger
}

func NewPostgresDataSource(logProvider logger.Logger) (*Postgres, error) {
	connStr := os.Getenv("DATABASE_URL")
	data, err := parseDatabaseURL(connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to access database: %w", err)
	}
	db, err := sql.Open("postgres", data)

	if err != nil {
		return nil, fmt.Errorf("failed to access database: %w", err)
	}
	if connectionLimit := os.Getenv("DATABASE_CONNECTION_LIMIT"); connectionLimit != "" {
		maxOpenConnections, err := strconv.Atoi(connectionLimit)
		if err != nil || maxOpenConnections <= 0 {
			return nil, fmt.Errorf("invalid database connection limit %q", connectionLimit)
		}
		db.SetMaxOpenConns(maxOpenConnections)
	}

	return &Postgres{client: db, logger: logProvider}, nil
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
func (p *Postgres) Save(ctx context.Context, elements []ElementIn) ([]int, error) {
	start := time.Now()
	p.logger.Log(logger.INFO, fmt.Sprintf("sql.save.start items=%d", len(elements)))
	if len(elements) == 0 {
		p.logger.Log(logger.WARN, "sql.save.skip reason=empty_elements")
		return nil, nil
	}

	problemID := elements[0].ProblemId
	for _, element := range elements[1:] {
		if element.ProblemId != problemID {
			return nil, fmt.Errorf("all testcases must have the same problemId")
		}
	}

	// Retiring and inserting are no longer wrapped in a single *sql.Tx. A *sql.Tx pins one
	// connection, so concurrent goroutines sharing it would serialize behind that connection's
	// internal lock instead of actually running in parallel — negating the whole point of
	// inserting per-testcase. Each insert below uses p.client (the connection pool) directly, so
	// goroutines get their own connections and genuinely run in parallel, the same way the admin
	// backend's testcase.service.ts::createTestcases already does (Promise.all of independent
	// prisma.create() calls, not wrapped in a transaction either). The tradeoff is the same one
	// already accepted for the S3 upload phase below: retire can succeed while some inserts fail,
	// leaving the problem with fewer (or zero) active testcases until retried.
	if _, err := p.client.ExecContext(
		ctx,
		`UPDATE public.problem_testcase
		 SET is_outdated = true, outdate_time = NOW()
		 WHERE problem_id = $1 AND is_outdated = false`,
		problemID,
	); err != nil {
		p.logger.Log(logger.ERROR, fmt.Sprintf("sql.save.failed stage=retire problem_id=%d err=%v", problemID, err))
		return nil, fmt.Errorf("failed to retire existing testcases: %w", err)
	}

	type insertResult struct {
		index int
		id    int
		err   error
	}
	resultChan := make(chan insertResult, len(elements))
	for idx, element := range elements {
		go func(idx int, element ElementIn) {
			var id int
			err := p.client.QueryRowContext(ctx,
				`INSERT INTO public.problem_testcase
				 (problem_id, is_hidden_testcase, "order", update_time)
				 VALUES ($1, $2, $3, $4)
				 RETURNING id`,
				element.ProblemId, element.Hidden, idx+1, start,
			).Scan(&id)
			resultChan <- insertResult{index: idx, id: id, err: err}
		}(idx, element)
	}

	ids := make([]int, len(elements))
	var errs []error
	for range elements {
		r := <-resultChan
		if r.err != nil {
			p.logger.Log(logger.ERROR, fmt.Sprintf("sql.save.failed stage=insert index=%d err=%v", r.index, r.err))
			errs = append(errs, r.err)
			continue
		}
		ids[r.index] = r.id // each goroutine knows its own index, so no matching column is needed
	}
	if len(errs) > 0 {
		return nil, fmt.Errorf("failed to save %d/%d testcases: %v", len(errs), len(elements), errs)
	}

	p.logger.Log(
		logger.INFO,
		fmt.Sprintf("sql.save.done inserted=%d duration=%s", len(elements), time.Since(start)),
	)
	return ids, nil
}

func (p *Postgres) Get(ctx context.Context, key string) ([]ElementOut, error) {
	const selectQuery = `
  SELECT id, input, output, is_hidden_testcase
  FROM public.problem_testcase
  WHERE problem_id = $1 AND is_outdated = false
    AND input IS NOT NULL AND output IS NOT NULL
  `
	start := time.Now()
	p.logger.Log(logger.INFO, fmt.Sprintf("sql.get.start problem_id=%s", key))

	rows, err := p.client.QueryContext(ctx, selectQuery, key)
	if err != nil {
		p.logger.Log(
			logger.ERROR,
			fmt.Sprintf("sql.get.failed stage=query problem_id=%s err=%v", key, err),
		)
		return nil, fmt.Errorf("failed to get key: %w", err)
	}

	defer rows.Close() //nolint:errcheck

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
	if err := rows.Err(); err != nil {
		p.logger.Log(logger.ERROR, fmt.Sprintf("sql.get.failed stage=iterate problem_id=%s err=%v", key, err))
		return nil, fmt.Errorf("database fetch error: %w", err)
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
