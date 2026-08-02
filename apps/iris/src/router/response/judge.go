package response

import (
	"encoding/json"
	"errors"
	"strconv"

	"github.com/skkuding/codedang/apps/iris/src/handler"
)

type JudgeResponse struct {
	SubmissionId    int                `json:"submissionId"`
	JudgeResultCode handler.ResultCode `json:"resultCode"`
	JudgeResult     json.RawMessage    `json:"judgeResult"`
	Finished        bool               `json:"finished"`
	Error           string             `json:"error"`
}

func NewJudgeResponse(id string, data json.RawMessage, err error) *JudgeResponse {
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
	return &JudgeResponse{
		SubmissionId:    _id,
		JudgeResultCode: resultCode,
		JudgeResult:     data,
		Error:           errMessage,
		Finished:        false,
	}
}

func (r *JudgeResponse) Marshal() []byte {

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
	if errors.Is(err, handler.ErrWrongAnswer) {
		return handler.WRONG_ANSWER
	}
	if errors.Is(err, handler.ErrCpuTimeLimitExceed) {
		return handler.CPU_TIME_LIMIT_EXCEEDED
	}
	if errors.Is(err, handler.ErrRealTimeLimitExceed) {
		return handler.REAL_TIME_LIMIT_EXCEEDED
	}
	if errors.Is(err, handler.ErrMemoryLimitExceed) {
		return handler.MEMORY_LIMIT_EXCEEDED
	}
	if errors.Is(err, handler.ErrRuntime) {
		return handler.RUNTIME_ERROR
	}
	if errors.Is(err, handler.ErrCompile) {
		return handler.COMPILE_ERROR
	}
	if errors.Is(err, handler.ErrTestcaseGet) {
		return handler.TESTCASE_ERROR
	}
	if errors.Is(err, handler.ErrSegFault) {
		return handler.SEGMENTATION_FAULT_ERROR
	}
	if errors.Is(err, handler.ErrCanceled) {
		return handler.CANCELED
	}
	return handler.SERVER_ERROR
}
