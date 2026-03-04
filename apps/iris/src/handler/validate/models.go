package validate

import (
	"fmt"
)

type ValidateRequest struct {
	ProblemId     int    `json:"problemId"`
	Language      string `json:"language"`
	ValidatorCode string `json:"validatorCode"`
}

func (r ValidateRequest) Validate() (*ValidateRequest, error) {
	if r.ProblemId == 0 {
		return nil, fmt.Errorf("problemId must not be empty or zero")
	}
	if r.Language == "" {
		return nil, fmt.Errorf("language must not be empty")
	}
	if r.ValidatorCode == "" {
		return nil, fmt.Errorf("validatorCode must not be empty")
	}
	return &r, nil
}

type ValidateResult struct {
	IsValid bool   `json:"isValid"`
	Error   string `json:"error,omitempty"`
}
