package router

import (
	"bytes"
	"encoding/json"
	"errors"
	"strconv"

	"github.com/skkuding/codedang/apps/plag/src/handler"
)

type Response struct {
	CheckId         int                `json:"checkId"`
	CheckResultCode handler.ResultCode `json:"resultCode"`
  CheckResult     json.RawMessage    `json:"checkResult"`
	Error           string             `json:"error"`
}

func NewResponse(id string,	result json.RawMessage, err error) *Response {
	resultCode := handler.CHECKED
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
		CheckId:         _id,
		CheckResultCode: resultCode,
    CheckResult:     result,
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
  if errors.Is(err, handler.ErrRunJPlag) {
		return handler.JPLAG_ERROR
	}
  if errors.Is(err, handler.ErrSmallTokens) {
		return handler.TOKEN_ERROR
	}
	return handler.SERVER_ERROR
}
