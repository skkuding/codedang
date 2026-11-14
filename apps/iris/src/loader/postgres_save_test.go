package loader

import (
	"context"
	"errors"
	"reflect"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
)

type saveTestLogger struct{}

func (saveTestLogger) Log(logger.Level, string)                             {}
func (saveTestLogger) LogWithContext(logger.Level, string, context.Context) {}
func (saveTestLogger) Panic(message string)                                 { panic(message) }

const saveInsertSQL = `INSERT INTO public.problem_testcase (problem_id, is_hidden_testcase, "order", update_time, is_outdated) VALUES ($1, $2, $3, $4, true) RETURNING id`
const activateLockSQL = `SELECT pg_advisory_xact_lock($1::bigint)`
const activateRetireSQL = `UPDATE public.problem_testcase SET is_outdated = true, outdate_time = NOW() WHERE problem_id = $1 AND is_outdated = false`
const activateSQL = `UPDATE public.problem_testcase SET is_outdated = false WHERE problem_id = $1 AND id = ANY($2::int[]) AND is_outdated = true AND outdate_time IS NULL`
const deletePendingSQL = `DELETE FROM public.problem_testcase WHERE id = ANY($1::int[]) AND is_outdated = true AND outdate_time IS NULL RETURNING id`

func newSaveTest(t *testing.T) (*Postgres, sqlmock.Sqlmock, context.Context) {
	t.Helper()
	db, mock, err := sqlmock.New(sqlmock.QueryMatcherOption(sqlmock.QueryMatcherEqual))
	if err != nil {
		t.Fatal(err)
	}
	// A transaction owns this sole connection. Accidentally querying through
	// p.client instead of tx cannot silently run outside the transaction.
	db.SetMaxOpenConns(1)
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	t.Cleanup(func() {
		cancel()
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Error(err)
		}
		_ = db.Close()
	})
	return &Postgres{client: db, logger: saveTestLogger{}}, mock, ctx
}

func TestPostgresSavePendingSuccess(t *testing.T) {
	p, mock, ctx := newSaveTest(t)
	mock.ExpectBegin()
	// No retire: the active testcases must stay untouched until Activate.
	mock.ExpectQuery(saveInsertSQL).WithArgs(7, true, 1, sqlmock.AnyArg()).WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(42)).RowsWillBeClosed()
	mock.ExpectQuery(saveInsertSQL).WithArgs(7, false, 2, sqlmock.AnyArg()).WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(99)).RowsWillBeClosed()
	mock.ExpectCommit()

	ids, err := p.SavePending(ctx, []ElementIn{{ProblemId: 7, Hidden: true}, {ProblemId: 7, Hidden: false}})
	if err != nil {
		t.Fatal(err)
	}
	if !reflect.DeepEqual(ids, []int{42, 99}) {
		t.Fatalf("IDs do not follow input order: %v", ids)
	}
}

func TestPostgresSavePendingFailure(t *testing.T) {
	for _, stage := range []string{"begin", "second insert", "commit"} {
		t.Run(stage, func(t *testing.T) {
			p, mock, ctx := newSaveTest(t)
			failure := errors.New("injected " + stage + " failure")
			begin := mock.ExpectBegin()
			if stage == "begin" {
				begin.WillReturnError(failure)
			} else {
				mock.ExpectQuery(saveInsertSQL).WithArgs(7, false, 1, sqlmock.AnyArg()).WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(42)).RowsWillBeClosed()
				second := mock.ExpectQuery(saveInsertSQL).WithArgs(7, true, 2, sqlmock.AnyArg())
				if stage == "second insert" {
					second.WillReturnError(failure)
					mock.ExpectRollback()
				} else {
					second.WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(99)).RowsWillBeClosed()
					// database/sql marks the transaction done after Commit, even on error;
					// the deferred Rollback then returns ErrTxDone without calling the driver.
					mock.ExpectCommit().WillReturnError(failure)
				}
			}
			ids, err := p.SavePending(ctx, []ElementIn{{ProblemId: 7}, {ProblemId: 7, Hidden: true}})
			if !errors.Is(err, failure) {
				t.Fatalf("expected wrapped %v, got %v", failure, err)
			}
			if ids != nil {
				t.Fatalf("must not expose IDs after failed save: %v", ids)
			}
		})
	}
}

func TestPostgresSavePendingInvalidInput(t *testing.T) {
	t.Run("empty", func(t *testing.T) {
		p, _, ctx := newSaveTest(t)
		ids, err := p.SavePending(ctx, nil)
		if err != nil || len(ids) != 0 {
			t.Fatalf("ids=%v err=%v", ids, err)
		}
	})
	t.Run("mixed problem IDs", func(t *testing.T) {
		p, _, ctx := newSaveTest(t)
		ids, err := p.SavePending(ctx, []ElementIn{{ProblemId: 7}, {ProblemId: 8}})
		if err == nil || ids != nil {
			t.Fatalf("ids=%v err=%v", ids, err)
		}
	})
}

func TestPostgresActivateSuccess(t *testing.T) {
	p, mock, ctx := newSaveTest(t)
	mock.ExpectBegin()
	mock.ExpectExec(activateLockSQL).WithArgs(int64(7)).WillReturnResult(sqlmock.NewResult(0, 1))
	mock.ExpectExec(activateRetireSQL).WithArgs(7).WillReturnResult(sqlmock.NewResult(0, 3))
	mock.ExpectExec(activateSQL).WithArgs(7, "{42,99}").WillReturnResult(sqlmock.NewResult(0, 2))
	mock.ExpectCommit()

	if err := p.Activate(ctx, 7, []int{42, 99}); err != nil {
		t.Fatal(err)
	}
}

func TestPostgresActivateFailure(t *testing.T) {
	for _, stage := range []string{"begin", "lock", "retire", "activate", "count mismatch", "commit"} {
		t.Run(stage, func(t *testing.T) {
			p, mock, ctx := newSaveTest(t)
			failure := errors.New("injected " + stage + " failure")
			begin := mock.ExpectBegin()
			if stage == "begin" {
				begin.WillReturnError(failure)
			} else {
				lock := mock.ExpectExec(activateLockSQL).WithArgs(int64(7))
				if stage == "lock" {
					lock.WillReturnError(failure)
				} else {
					lock.WillReturnResult(sqlmock.NewResult(0, 1))
					retire := mock.ExpectExec(activateRetireSQL).WithArgs(7)
					if stage == "retire" {
						retire.WillReturnError(failure)
					} else {
						retire.WillReturnResult(sqlmock.NewResult(0, 3))
						activate := mock.ExpectExec(activateSQL).WithArgs(7, "{42,99}")
						switch stage {
						case "activate":
							activate.WillReturnError(failure)
						case "count mismatch":
							// One pending row vanished: the swap must be rolled back.
							activate.WillReturnResult(sqlmock.NewResult(0, 1))
						default:
							activate.WillReturnResult(sqlmock.NewResult(0, 2))
							mock.ExpectCommit().WillReturnError(failure)
						}
					}
				}
				if stage != "commit" {
					mock.ExpectRollback()
				}
			}
			err := p.Activate(ctx, 7, []int{42, 99})
			if err == nil {
				t.Fatal("expected an error")
			}
			if stage != "count mismatch" && !errors.Is(err, failure) {
				t.Fatalf("expected wrapped %v, got %v", failure, err)
			}
		})
	}
}

func TestPostgresActivateEmpty(t *testing.T) {
	p, _, ctx := newSaveTest(t)
	if err := p.Activate(ctx, 7, nil); err != nil {
		t.Fatal(err)
	}
}

func TestPostgresDeletePending(t *testing.T) {
	t.Run("returns only the rows actually deleted", func(t *testing.T) {
		p, mock, ctx := newSaveTest(t)
		mock.ExpectQuery(deletePendingSQL).WithArgs("{42,99}").WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(42)).RowsWillBeClosed()

		deleted, err := p.DeletePending(ctx, []int{42, 99})
		if err != nil {
			t.Fatal(err)
		}
		if !reflect.DeepEqual(deleted, []int{42}) {
			t.Fatalf("deleted=%v", deleted)
		}
	})
	t.Run("query failure", func(t *testing.T) {
		p, mock, ctx := newSaveTest(t)
		failure := errors.New("injected delete failure")
		mock.ExpectQuery(deletePendingSQL).WithArgs("{42}").WillReturnError(failure)

		deleted, err := p.DeletePending(ctx, []int{42})
		if !errors.Is(err, failure) || deleted != nil {
			t.Fatalf("deleted=%v err=%v", deleted, err)
		}
	})
	t.Run("empty", func(t *testing.T) {
		p, _, ctx := newSaveTest(t)
		deleted, err := p.DeletePending(ctx, nil)
		if err != nil || deleted != nil {
			t.Fatalf("deleted=%v err=%v", deleted, err)
		}
	})
}
