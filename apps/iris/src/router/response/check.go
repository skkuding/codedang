package response

import (
	"encoding/json"

	"github.com/skkuding/codedang/apps/iris/src/common/taskerror"
)

type CheckResponse struct {
	MessageId  string               `json:"messageId"`
	ProblemId  int                  `json:"problemId"`
	ToolType   string               `json:"toolType"`
	ResultCode taskerror.ResultCode `json:"resultCode"`
	ToolResult json.RawMessage      `json:"toolResult"`
	Error      string               `json:"error"`
}

func NewCheckResponse(messageID string, problemID int, data json.RawMessage, err error) *CheckResponse {
	resultCode, message := toolResult(err)
	return &CheckResponse{
		MessageId: messageID, ProblemId: problemID, ToolType: "checker",
		ResultCode: resultCode, ToolResult: data, Error: message,
	}
}

func (r *CheckResponse) Marshal() ([]byte, error) { return JSONMarshal(r) }
