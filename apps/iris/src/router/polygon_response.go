package router

import (
	"encoding/json"

	"github.com/skkuding/codedang/apps/iris/src/handler"
)

type PolygonToolResponse struct {
	MessageId  string             `json:"messageId"`
	ProblemId  int                `json:"problemId"`
	ToolType   string             `json:"toolType"`
	ResultCode handler.ResultCode `json:"resultCode"`
	ToolResult json.RawMessage    `json:"toolResult"`
	Error      string             `json:"error"`
}

func NewPolygonToolResponse(messageId string, problemId int, toolType string, data json.RawMessage, err error) *PolygonToolResponse {
	resultCode := handler.ACCEPTED
	errMessage := ""

	if err != nil {
		errMessage = handler.ExtractUserMessage(err)
		resultCode = handler.ExtractResultCode(err)
	}

	return &PolygonToolResponse{
		MessageId:  messageId,
		ProblemId:  problemId,
		ToolType:   toolType,
		ResultCode: resultCode,
		ToolResult: data,
		Error:      errMessage,
	}
}

func (r *PolygonToolResponse) Marshal() []byte {
	if res, err := JSONMarshal(r); err != nil {
		panic(err)
	} else {
		return res
	}
}
