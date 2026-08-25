package response

import (
	"bytes"
	"encoding/json"

	"github.com/skkuding/codedang/apps/iris/src/common/constants"
	"github.com/skkuding/codedang/apps/iris/src/common/taskerror"
)

type Response struct {
	Message []byte
	Type    constants.MessageType
}

func toolResult(err error) (taskerror.ResultCode, string) {
	if err == nil {
		return taskerror.ACCEPTED, ""
	}
	return taskerror.ExtractResultCode(err), taskerror.ExtractUserMessage(err)
}

func JSONMarshal(t interface{}) ([]byte, error) {
	// source: https://stackoverflow.com/questions/28595664/how-to-stop-json-marshal-from-escaping-and
	buffer := &bytes.Buffer{}
	encoder := json.NewEncoder(buffer)
	encoder.SetEscapeHTML(false)
	err := encoder.Encode(t)
	return buffer.Bytes(), err
}
