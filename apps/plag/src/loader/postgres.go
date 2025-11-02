package loader

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"os"
	"regexp"
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

func ParseRawJson(rawCode string) string {
  cleanedString := rawCode[2 : len(rawCode)-2]

  var jsonString strings.Builder
  for _, parsedCode := range strings.Split(cleanedString, "text\\\": \\\"") {
    pCode := strings.Split(parsedCode, "\\\", \\\"locked")

    if len(pCode) == 1 {
      jsonString.WriteString(strings.ReplaceAll(pCode[0], `\"`, `"`))
    } else if len(pCode) == 2 {
      jsonString.WriteString("text\": \"")
      jsonString.WriteString(pCode[0])
      jsonString.WriteString("\", \"locked")
      jsonString.WriteString(strings.ReplaceAll(pCode[1], `\"`, `"`))
    }
  }

  return jsonString.String()
}

func ParseRawCode(rawCode string) string {
  re := regexp.MustCompile(`\\[ntr"]`)
	codeWithNewlines := re.ReplaceAllStringFunc(rawCode, func(s string) string { // 보완이 필요합니다.
		switch s {
		case `\n`:
			return "\n"
		case `\t`:
			return "\t"
		case `\r`:
			return "\r"
    case `\"`:
			return "\""
		default:
			return s
		}
	})

  return codeWithNewlines
}

func GetAllCodes(rows *sql.Rows, problemId string) ([]Element, error) {
  var result []Element

	for rows.Next() {
		var id int
		var userId int
		var rawCode string
		var createTime string

		if err := rows.Scan(&id, &userId, &rawCode, &createTime); err != nil {
			return nil, fmt.Errorf("database fetch error: %w", err)
		}

    data := []byte(ParseRawJson(rawCode))
    var codePiece CodePiece

    err := json.Unmarshal(data, &codePiece)
    if err != nil {
      return nil, fmt.Errorf("json unmarshal: %e", err)
    }

		result = append(result, Element{
			Id: id,
			UserId: userId,
			Code: ParseRawCode(codePiece.Text),
			CreateTime: createTime,
		})
	}

	if len(result) < 2 {
		return nil, fmt.Errorf("not enough submissions found for problemId: %s, submissionCount: %d", problemId, len(result))
	}

	return result, nil
}

func (p *Postgres) GetRawBaseCode(problemId string, language string) (string, error) {
  baseCodeRow := p.client.QueryRow(`SELECT template FROM public.problem WHERE id = $1`, problemId)

  var rawBaseCode string
  err := baseCodeRow.Scan(&rawBaseCode)

  if err == sql.ErrNoRows{
    return "", nil
  } else if err != nil {
    return "", fmt.Errorf("database fetch error: %w", err)
  }

  data := []byte(ParseRawJson(rawBaseCode))
	var result []TemplateItem

	err = json.Unmarshal(data, &result)
	if err != nil {
		return "", fmt.Errorf("database json unmarshal: %e", err)
	}

  var codeBuilder strings.Builder
  for _, r := range result {
    if r.Language == language {
      for _, c := range r.Code {
        codeBuilder.WriteString(ParseRawCode(c.Text))
        codeBuilder.WriteString("\n")
      }
    }
  }

  return codeBuilder.String(), nil
}

func (p *Postgres) GetAllCodesFromAssignment(problemId string, language string, assignmentId string) (string, []Element, error) {
  rows, err := p.client.Query(`SELECT DISTINCT ON (user_id) id, user_id, code, create_time FROM public.submission WHERE problem_id = $1 AND language = $2 AND assignment_id = $3 ORDER BY user_id, update_time DESC`, problemId, language, assignmentId)
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
  rows, err := p.client.Query(`SELECT DISTINCT ON (user_id) id, user_id, code, create_time FROM public.submission WHERE problem_id = $1 AND language = $2 AND contest_id = $3 ORDER BY user_id, update_time DESC`, problemId, language, contestId)
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
  rows, err := p.client.Query(`SELECT DISTINCT ON (user_id) id, user_id, code, create_time FROM public.submission WHERE problem_id = $1 AND language = $2 AND workbook_id = $3 ORDER BY user_id, update_time DESC`, problemId, language, workbookId)
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
