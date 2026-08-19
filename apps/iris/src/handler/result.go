package handler

import "encoding/json"

type ResultMessage struct {
	Result   json.RawMessage
	Err      error
	Response []byte
}

// ResultSender delivers a task result to the caller-provided result sink.
// The sender does not own the underlying channel or its lifecycle.
type ResultSender func(ResultMessage)
