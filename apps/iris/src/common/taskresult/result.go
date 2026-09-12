package taskresult

import "encoding/json"

type Message struct {
	Result          json.RawMessage
	Err             error
	EncodedResponse []byte
}
