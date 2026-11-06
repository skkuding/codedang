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

	// All database changes below use the same transaction.
	tx, err := p.client.BeginTx(ctx, &sql.TxOptions{
		Isolation: sql.LevelReadCommitted,
	})

	if err != nil {
		return nil, fmt.Errorf("failed to begin testcase transaction: %w", err)
	}

	// Roll back on any early return. After Commit, ErrTxDone is expected.
	defer func() {
		_ = tx.Rollback()
	}()

	// Acquire the lock before retiring any rows.
	// The lock is automatically released when the transaction ends.
	if _, err := tx.ExecContext(
		ctx,
		`SELECT pg_advisory_xact_lock($1::bigint)`,
		int64(problemID),
	); err != nil {
		return nil, fmt.Errorf(
			"failed to acquire testcase lock for problem %d: %w",
			problemID,
			err,
		)
	}

	if _, err := tx.ExecContext(
		ctx,
		`UPDATE public.problem_testcase
		 SET is_outdated = true, outdate_time = NOW()
		 WHERE problem_id = $1 AND is_outdated = false`,
		problemID,
	); err != nil {
		p.logger.Log(
			logger.ERROR,
			fmt.Sprintf("sql.save.failed stage=retire problem_id=%d err=%v",
				problemID,
				err,
			),
		)
		return nil, fmt.Errorf("failed to retire existing testcases: %w", err)
	}

	// Insert sequentially on the transaction's single connection.
	// Preserve the correspondence between input elements and returned IDs.
	ids := make([]int, len(elements))

	for idx, element := range elements {
		if err := tx.QueryRowContext(
			ctx,
			`INSERT INTO public.problem_testcase
			 (problem_id, is_hidden_testcase, "order", update_time)
			 VALUES ($1, $2, $3, $4)
			 RETURNING id`,
			element.ProblemId,
			element.Hidden,
			idx+1,
			start,
		).Scan(&ids[idx]); err != nil {
			p.logger.Log(
				logger.ERROR,
				fmt.Sprintf(
					"sql.save.failed stage=insert index=%d err=%v",
					idx,
					err,
				),
			)
			return nil, fmt.Errorf(
				"failed to save testcase at index %d: %w",
				idx,
				err,
			)
		}
	}

	// Return IDs only after a successful commit.
	if err := tx.Commit(); err != nil {
		p.logger.Log(
			logger.ERROR,
			fmt.Sprintf(
				"sql.save.failed stage=commit problem_id=%d err=%v",
				problemID,
				err,
			),
		)
		return nil, fmt.Errorf("failed to commit testcase replacement: %w", err)
	}

	p.logger.Log(
		logger.INFO,
		fmt.Sprintf(
			"sql.save.done inserted=%d duration=%s",
			len(elements),
			time.Since(start),
		),
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
