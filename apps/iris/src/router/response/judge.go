package response

import (
	"encoding/json"
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
		errMessage = handler.ExtractUserMessage(err)
		resultCode = handler.ExtractResultCode(err)
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
