package loader

import (
	"context"
	"database/sql"
	"encoding/json"
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
		var rawCode []byte
		var createTime string

		if err := rows.Scan(&id, &userId, &rawCode, &createTime); err != nil {
			return nil, fmt.Errorf("database fetch error: %w", err)
		}

		if len(rawCode) < 4 {
			return nil, fmt.Errorf("code length error: json is too short")
		}

		var codePieces []CodePiece
		err := json.Unmarshal(rawCode, &codePieces)
		if err != nil {
			return nil, fmt.Errorf("json unmarshal: %w", err)
		}

		var code strings.Builder
		for _, codePiece := range codePieces {
			code.WriteString(codePiece.Text)
		}

		result = append(result, Element{
			Id:         id,
			UserId:     userId,
			Code:       code.String(),
			CreateTime: createTime,
		})
	}

	if len(result) < 2 {
		return nil, fmt.Errorf("not enough submissions found for problemId: %s, submissionCount: %d", problemId, len(result))
	}

	return result, nil
}

func (p *Postgres) GetRawBaseCode(problemId string, language string) (string, error) {
	baseCodeRow := p.client.QueryRow(`SELECT COALESCE(to_jsonb(template), '[]'::jsonb) FROM public.problem WHERE id = $1`, problemId)

	var rawBaseCode []byte
	err := baseCodeRow.Scan(&rawBaseCode)

	if err == sql.ErrNoRows {
		return "", nil
	} else if err != nil {
		return "", fmt.Errorf("database fetch error: %w", err)
	}

	var innerString []string
	if err := json.Unmarshal(rawBaseCode, &innerString); err != nil {
		return "", fmt.Errorf("database json unmarshal: %w", err)
	}

	var arrayData []TemplateItem
	if err := json.Unmarshal([]byte(innerString[0]), &arrayData); err != nil {
		return "", fmt.Errorf("database json unmarshal: %w", err)
	}

	var baseCode strings.Builder
	for _, item := range arrayData {
		if item.Language == language {
			for _, codePiece := range item.Code {
				baseCode.WriteString(codePiece.Text)
			}
			return baseCode.String(), nil
		}
	}

	return "", nil
}

func (p *Postgres) GetAllCodesFromAssignment(problemId string, language string, assignmentId string) (string, []Element, error) {
	rows, err := p.client.Query(`SELECT DISTINCT ON (user_id) id, user_id, COALESCE(to_jsonb(code), '[]'::jsonb), create_time
                               FROM public.submission
                               WHERE problem_id = $1 AND language = $2 AND assignment_id = $3
                               ORDER BY user_id, update_time DESC`, problemId, language, assignmentId)
	if err != nil {
		return "", nil, fmt.Errorf("failed to get data: %w", err)
	}

	defer rows.Close()

	codes, err := GetAllCodes(rows, problemId)

	if err != nil {
		return "", nil, fmt.Errorf("failed to get data: %w", err)
	}

	baseCode, err := p.GetRawBaseCode(problemId, language)

	if err != nil {
		return "", nil, fmt.Errorf("failed to get data: %w", err)
	}

	return baseCode, codes, nil
}

func (p *Postgres) GetAllCodesFromContest(problemId string, language string, contestId string) (string, []Element, error) {
	rows, err := p.client.Query(`SELECT DISTINCT ON (user_id) id, user_id, COALESCE(to_jsonb(code), '[]'::jsonb), create_time
                              FROM public.submission
                              WHERE problem_id = $1 AND language = $2 AND contest_id = $3
                              ORDER BY user_id, update_time DESC`, problemId, language, contestId)
	if err != nil {
		return "", nil, fmt.Errorf("failed to get data: %w", err)
	}

	defer rows.Close()

	codes, err := GetAllCodes(rows, problemId)

	if err != nil {
		return "", nil, fmt.Errorf("failed to get data: %w", err)
	}

	baseCode, err := p.GetRawBaseCode(problemId, language)

	if err != nil {
		return "", nil, fmt.Errorf("failed to get data: %w", err)
	}

	return baseCode, codes, nil
}

func (p *Postgres) GetAllCodesFromWorkbook(problemId string, language string, workbookId string) (string, []Element, error) {
	rows, err := p.client.Query(`SELECT DISTINCT ON (user_id) id, user_id, COALESCE(to_jsonb(code), '[]'::jsonb), create_time
                              FROM public.submission
                              WHERE problem_id = $1 AND language = $2 AND workbook_id = $3
                              ORDER BY user_id, update_time DESC`, problemId, language, workbookId)
	if err != nil {
		return "", nil, fmt.Errorf("failed to get data: %w", err)
	}

	defer rows.Close()

	codes, err := GetAllCodes(rows, problemId)

	if err != nil {
		return "", nil, fmt.Errorf("failed to get data: %w", err)
	}

	baseCode, err := p.GetRawBaseCode(problemId, language)

	if err != nil {
		return "", nil, fmt.Errorf("failed to get data: %w", err)
	}

	return baseCode, codes, nil
}
