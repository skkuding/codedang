package response

import (
	"bytes"
	"encoding/json"
)

type Response interface {
	Marshal() []byte
}

func JSONMarshal(t interface{}) ([]byte, error) {
	// source: https://stackoverflow.com/questions/28595664/how-to-stop-json-marshal-from-escaping-and
	buffer := &bytes.Buffer{}
	encoder := json.NewEncoder(buffer)
	encoder.SetEscapeHTML(false)
	err := encoder.Encode(t)
	return buffer.Bytes(), err
}
