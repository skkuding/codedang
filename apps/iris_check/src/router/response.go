package router

import (
	"bytes"
	"encoding/json"
	"strconv"

	"github.com/skkuding/codedang/apps/iris_check/src/handler"
)

type Response struct {
	SubmissionId    int                `json:"submissionId"`
	JudgeResultCode handler.ResultCode `json:"resultCode"`
	JudgeResult     json.RawMessage    `json:"judgeResult"`
	Error           string             `json:"error"`
}

func NewResponse(id string, data json.RawMessage, err error) *Response {
	resultCode := handler.ACCEPTED
	errMessage := ""

	if err != nil {
		if handlerErr, ok := err.(*handler.HandlerError); ok {
			errMessage = handlerErr.Message
		} else {
			errMessage = err.Error()
		}
		resultCode = ErrorToResultCode(err)
	}

	_id, _ := strconv.Atoi(id)
	return &Response{
		SubmissionId:    _id,
		JudgeResultCode: resultCode,
		JudgeResult:     data,
		Error:           errMessage,
	}
}

func JSONMarshal(t interface{}) ([]byte, error) {
	// source: https://stackoverflow.com/questions/28595664/how-to-stop-json-marshal-from-escaping-and
	buffer := &bytes.Buffer{}
	encoder := json.NewEncoder(buffer)
	encoder.SetEscapeHTML(false)
	err := encoder.Encode(t)
	return buffer.Bytes(), err
}

func (r *Response) Marshal() []byte {

	if res, err := JSONMarshal(r); err != nil {
		// Error on marshaling router response means that
		// the process cannot send valid response data
		// because some logic is incorrect.
		// So, panic without recover because debugging is needed
		panic(err)
	} else {
		return res
	}
}

func ErrorToResultCode(err error) handler.ResultCode {
	return handler.SERVER_ERROR
}
