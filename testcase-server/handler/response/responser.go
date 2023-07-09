package response

import (
	"encoding/json"
	"net/http"
)

type Responser interface {
	Ok(w http.ResponseWriter, data json.RawMessage, code int)
	Error(w http.ResponseWriter, error string, code int)
}

type responser struct {
}

func NewResponser() *responser {
	return &responser{}
}

func (r *responser) Ok(w http.ResponseWriter, data json.RawMessage, code int) {
	w.WriteHeader(code)
	w.Write(data)
}

func (r *responser) Error(w http.ResponseWriter, error string, code int) {
	w.WriteHeader(code)
	d := ErrorResponse{StatusCode: code, Message: error}
	d.Encode(w)
}
