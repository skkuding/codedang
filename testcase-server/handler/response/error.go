package response

import (
	"encoding/json"
	"net/http"
)

type ErrorResponse struct {
	StatusCode int             `json:"statusCode"`
	Message    string          `json:"message"`
	Data       json.RawMessage `json:"data"`
}

func (e *ErrorResponse) Encode(w http.ResponseWriter) {
	json.NewEncoder(w).Encode(e)
}
