package loader

import (
	"context"
	"database/sql"
	"fmt"
	"net/url"
	"os"
	"strconv"
	"strings"
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

// intArrayLiteral encodes ids as a Postgres array literal (e.g. "{1,2,3}") so it can be
// bound as a single `$n::int[]` parameter without a driver-specific array type.
func intArrayLiteral(ids []int) string {
	parts := make([]string, len(ids))
	for i, id := range ids {
		parts[i] = strconv.Itoa(id)
	}
	return "{" + strings.Join(parts, ",") + "}"
}

// SavePending inserts elements as pending rows and returns their ids, indexed the same way
// as elements. Pending rows are stored with is_outdated = true and outdate_time = NULL.
// todo: need to introduce prisma like ORM
func (p *Postgres) SavePending(ctx context.Context, elements []ElementIn) ([]int, error) {
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

	// Insert every pending row in one transaction so a failure leaves none behind.
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

	// Insert sequentially on the transaction's single connection.
	// Preserve the correspondence between input elements and returned IDs.
	ids := make([]int, len(elements))

	for idx, element := range elements {
		if err := tx.QueryRowContext(
			ctx,
			`INSERT INTO public.problem_testcase
			 (problem_id, is_hidden_testcase, "order", update_time, is_outdated)
			 VALUES ($1, $2, $3, $4, true)
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
		return nil, fmt.Errorf("failed to commit pending testcases: %w", err)
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

// Activate atomically retires the problem's currently active testcases and activates the
// pending rows in ids. It changes nothing and returns an error unless every id is still a
// pending row of problemID.
func (p *Postgres) Activate(ctx context.Context, problemID int, ids []int) error {
	if len(ids) == 0 {
		return nil
	}

	tx, err := p.client.BeginTx(ctx, &sql.TxOptions{
		Isolation: sql.LevelReadCommitted,
	})
	if err != nil {
		return fmt.Errorf("failed to begin testcase activation: %w", err)
	}

	// Roll back on any early return. After Commit, ErrTxDone is expected.
	defer func() {
		_ = tx.Rollback()
	}()

	// Serialize activations of the same problem so exactly one testcase set ends up active.
	// The lock is automatically released when the transaction ends.
	if _, err := tx.ExecContext(
		ctx,
		`SELECT pg_advisory_xact_lock($1::bigint)`,
		int64(problemID),
	); err != nil {
		return fmt.Errorf(
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
			fmt.Sprintf("sql.activate.failed stage=retire problem_id=%d err=%v", problemID, err),
		)
		return fmt.Errorf("failed to retire existing testcases: %w", err)
	}

	result, err := tx.ExecContext(
		ctx,
		`UPDATE public.problem_testcase
		 SET is_outdated = false
		 WHERE problem_id = $1 AND id = ANY($2::int[])
		   AND is_outdated = true AND outdate_time IS NULL`,
		problemID,
		intArrayLiteral(ids),
	)
	if err != nil {
		p.logger.Log(
			logger.ERROR,
			fmt.Sprintf("sql.activate.failed stage=activate problem_id=%d err=%v", problemID, err),
		)
		return fmt.Errorf("failed to activate testcases: %w", err)
	}
	activated, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to count activated testcases: %w", err)
	}
	if activated != int64(len(ids)) {
		return fmt.Errorf(
			"activated %d of %d pending testcases for problem %d",
			activated,
			len(ids),
			problemID,
		)
	}

	if err := tx.Commit(); err != nil {
		p.logger.Log(
			logger.ERROR,
			fmt.Sprintf("sql.activate.failed stage=commit problem_id=%d err=%v", problemID, err),
		)
		return fmt.Errorf("failed to commit testcase activation: %w", err)
	}

	p.logger.Log(
		logger.INFO,
		fmt.Sprintf("sql.activate.done problem_id=%d activated=%d", problemID, activated),
	)
	return nil
}

// DeletePending removes the rows in ids that are still pending and returns the ids it
// actually removed. Rows that were activated (or retired) are never touched, so callers
// must only clean up external data such as S3 objects for the returned ids.
func (p *Postgres) DeletePending(ctx context.Context, ids []int) ([]int, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	rows, err := p.client.QueryContext(
		ctx,
		`DELETE FROM public.problem_testcase
		 WHERE id = ANY($1::int[]) AND is_outdated = true AND outdate_time IS NULL
		 RETURNING id`,
		intArrayLiteral(ids),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to delete pending testcases: %w", err)
	}
	defer rows.Close() //nolint:errcheck

	var deleted []int
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			return nil, fmt.Errorf("failed to read deleted testcase id: %w", err)
		}
		deleted = append(deleted, id)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("failed to delete pending testcases: %w", err)
	}
	return deleted, nil
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
