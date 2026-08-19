package response

import (
	"strconv"
)

type SubmissionResponse struct {
	SubmissionId int              `json:"submissionId"`
	JudgeResults []*JudgeResponse `json:"judgeResults"`
	Finished     bool             `json:"finished"`
}

func NewSubmissionResponse(id string, judgeResponses []*JudgeResponse) *SubmissionResponse {
	// TODO: JudgeResponse 가공하기

	_id, _ := strconv.Atoi(id)
	return &SubmissionResponse{
		SubmissionId: _id,
		JudgeResults: judgeResponses,
		Finished:     true,
	}
}

func (r *SubmissionResponse) formatJudgeResponse(res *JudgeResponse) {}

func (r *SubmissionResponse) Marshal() []byte {

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
