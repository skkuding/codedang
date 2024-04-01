package router

import (
	"bytes"
	"encoding/json"
	"errors"

	"github.com/skkuding/codedang/apps/iris/src/handler"
)

type ResultCode int8
type Response struct {
	SubmissionId string          `json:"submissionId"`
	ResultCode   ResultCode      `json:"resultCode"`
	Data         json.RawMessage `json:"data"`
	Error        string          `json:"error"`
}

const (
	ACCEPTED ResultCode = 0 + iota
	WRONG_ANSWER
	CPU_TIME_LIMIT_EXCEEDED
	REAL_TIME_LIMIT_EXCEEDED
	MEMORY_LIMIT_EXCEEDED
	RUNTIME_ERROR
	COMPILE_ERROR
	TESTCASE_ERROR
	SERVER_ERROR
)

func NewResponse(id string, data json.RawMessage, err error) *Response {
	resultCode := ACCEPTED
	errMessage := ""
	// var errMessage json.RawMessage

	if err != nil {
		if handlerErr, ok := err.(*handler.HandlerError); ok {
			errMessage = handlerErr.Message
		} else {
			errMessage = err.Error()
		}
		resultCode = ErrorToResultCode(err)
	}

	return &Response{
		SubmissionId: id,
		ResultCode:   resultCode,
		Data:         data,
		Error:        errMessage,
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

func ErrorToResultCode(err error) ResultCode {
	if errors.Is(err, handler.ErrWrongAnswer) {
		return WRONG_ANSWER
	}
	if errors.Is(err, handler.ErrCpuTimeLimitExceed) {
		return CPU_TIME_LIMIT_EXCEEDED
	}
	if errors.Is(err, handler.ErrRealTimeLimitExceed) {
		return REAL_TIME_LIMIT_EXCEEDED
	}
	if errors.Is(err, handler.ErrMemoryLimitExceed) {
		return MEMORY_LIMIT_EXCEEDED
	}
	if errors.Is(err, handler.ErrRuntime) {
		return RUNTIME_ERROR
	}
	if errors.Is(err, handler.ErrCompile) {
		return COMPILE_ERROR
	}
	if errors.Is(err, handler.ErrTestcaseGet) {
		return TESTCASE_ERROR
	}
	return SERVER_ERROR
}
