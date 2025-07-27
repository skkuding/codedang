package handler

import (
	"encoding/json"
)

type Handler interface {
	Handle(data interface{}) (json.RawMessage, error)
}
