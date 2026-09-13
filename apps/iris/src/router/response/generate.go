package response

import (
	"encoding/json"

	"github.com/skkuding/codedang/apps/iris/src/common/taskerror"
)

type GenerateResponse struct {
	MessageId  string               `json:"messageId"`
	ProblemId  int                  `json:"problemId"`
	ToolType   string               `json:"toolType"`
	ResultCode taskerror.ResultCode `json:"resultCode"`
	ToolResult json.RawMessage      `json:"toolResult"`
	Error      string               `json:"error"`
}

func NewGenerateResponse(messageID string, problemID int, data json.RawMessage, err error) *GenerateResponse {
	resultCode, message := toolResult(err)
	return &GenerateResponse{
		MessageId: messageID, ProblemId: problemID, ToolType: "generator",
		ResultCode: resultCode, ToolResult: data, Error: message,
	}
}

func (r *GenerateResponse) Marshal() ([]byte, error) { return JSONMarshal(r) }
