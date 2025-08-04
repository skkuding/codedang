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

func GetAllCodes(rows *sql.Rows, problemId string) ([]Element, error) {
  var result []Element

	for rows.Next() {
		var id int
		var userId int
		var code string
		var createTime string

		if err := rows.Scan(&id, &userId, &code, &createTime); err != nil {
			return nil, fmt.Errorf("database fetch error: %w", err)
		}

		result = append(result, Element{
			Id: id,
			UserId: userId,
			Code: code,
			CreateTime: createTime,
		})
	}

	if len(result) == 0 {
		return nil, fmt.Errorf("no submission found for problemId: %s", problemId)
	}

	return result, nil
}

func (p *Postgres) GetRawBaseCode(problemId string) (string, error) {
  baseCodeRow := p.client.QueryRow(`SELECT template FROM public.problem WHERE id = $1`, problemId)

  var rawBaseCode string
  err := baseCodeRow.Scan(&rawBaseCode)

  if err == sql.ErrNoRows{
    return "", nil
  } else if err != nil {
    return "", fmt.Errorf("database fetch error: %w", err)
  }
  return rawBaseCode, nil
}

func (p *Postgres) GetAllCodesFromAssignment(problemId string, language string, assignmentId string) (string, []Element, error) {
  rows, err := p.client.Query(`SELECT id, user_id, code, create_time FROM public.submission WHERE problem_id = $1 AND language = $2 AND assignment_id = $3`, problemId, language, assignmentId)
  if err != nil {
		return "", nil, fmt.Errorf("failed to get data: %w", err)
	}

  defer rows.Close()

  codes, err := GetAllCodes(rows, problemId)

  if err != nil {
		return "", nil, fmt.Errorf("failed to get data: %w", err)
	}

  baseCode, err := p.GetRawBaseCode(problemId)

  if err != nil {
		return "", nil, fmt.Errorf("failed to get data: %w", err)
	}

  return baseCode, codes, nil
}

func (p *Postgres) GetAllCodesFromContest(problemId string, language string, contestId string) (string, []Element, error) {
  rows, err := p.client.Query(`SELECT id, user_id, code, create_time FROM public.submission WHERE problem_id = $1 AND language = $2 AND contest_id = $3`, problemId, language, contestId)
  if err != nil {
		return "", nil, fmt.Errorf("failed to get data: %w", err)
	}

  defer rows.Close()

  codes, err := GetAllCodes(rows, problemId)

  if err != nil {
		return "", nil, fmt.Errorf("failed to get data: %w", err)
	}

  baseCode, err := p.GetRawBaseCode(problemId)

  if err != nil {
		return "", nil, fmt.Errorf("failed to get data: %w", err)
	}

  return baseCode, codes, nil
}

func (p *Postgres) GetAllCodesFromWorkbook(problemId string, language string, workbookId string) (string, []Element, error) {
  rows, err := p.client.Query(`SELECT id, user_id, code, create_time FROM public.submission WHERE problem_id = $1 AND language = $2 AND workbook_id = $3`, problemId, language, workbookId)
  if err != nil {
		return "", nil, fmt.Errorf("failed to get data: %w", err)
	}

  defer rows.Close()

  codes, err := GetAllCodes(rows, problemId)

  if err != nil {
		return "", nil, fmt.Errorf("failed to get data: %w", err)
	}

  baseCode, err := p.GetRawBaseCode(problemId)

  if err != nil {
		return "", nil, fmt.Errorf("failed to get data: %w", err)
	}

  return baseCode, codes, nil
}
