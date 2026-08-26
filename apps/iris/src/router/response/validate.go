package response

import (
	"encoding/json"

	"github.com/skkuding/codedang/apps/iris/src/common/taskerror"
)

type ValidateResponse struct {
	MessageId  string               `json:"messageId"`
	ProblemId  int                  `json:"problemId"`
	ToolType   string               `json:"toolType"`
	ResultCode taskerror.ResultCode `json:"resultCode"`
	ToolResult json.RawMessage      `json:"toolResult"`
	Error      string               `json:"error"`
}

func NewValidateResponse(messageID string, problemID int, data json.RawMessage, err error) *ValidateResponse {
	resultCode, message := toolResult(err)
	return &ValidateResponse{
		MessageId: messageID, ProblemId: problemID, ToolType: "validator",
		ResultCode: resultCode, ToolResult: data, Error: message,
	}
}

func (r *ValidateResponse) Marshal() ([]byte, error) { return JSONMarshal(r) }
