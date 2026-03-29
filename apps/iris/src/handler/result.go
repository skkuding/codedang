package handler

import "encoding/json"

type ResultMessage struct {
	Result json.RawMessage
	Err    error
}

type ResultSender2Runner func(ResultMessage)
