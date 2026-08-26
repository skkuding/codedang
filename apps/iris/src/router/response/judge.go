package response

import (
	"encoding/json"
	"strconv"

	"github.com/skkuding/codedang/apps/iris/src/common/taskerror"
)

type JudgeResponse struct {
	SubmissionId    int                  `json:"submissionId"`
	JudgeResultCode taskerror.ResultCode `json:"resultCode"`
	JudgeResult     json.RawMessage      `json:"judgeResult"`
	Error           string               `json:"error"`
}

func NewJudgeResponse(id string, data json.RawMessage, err error) *JudgeResponse {
	resultCode := taskerror.ACCEPTED
	errMessage := ""

	if err != nil {
		errMessage = taskerror.ExtractUserMessage(err)
		resultCode = taskerror.ExtractResultCode(err)
	}

	_id, _ := strconv.Atoi(id)
	return &JudgeResponse{
		SubmissionId:    _id,
		JudgeResultCode: resultCode,
		JudgeResult:     data,
		Error:           errMessage,
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
