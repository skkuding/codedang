package response

import (
	"encoding/json"
	"fmt"

	"github.com/skkuding/codedang/apps/iris/src/common/taskerror"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
)

type Sender interface {
	Marshal(result json.RawMessage, taskErr error) ([]byte, error)
}

type judgeSender struct{ messageID string }
type generateSender struct {
	messageID string
	problemID int
}
type validateSender struct {
	messageID string
	problemID int
}
type checkSender struct {
	messageID string
	problemID int
}

// PrepareSender chooses the response contract from the AMQP message type.
// problemId belongs only to tool contracts and is extracted by those senders.
func PrepareSender(path, messageID string, data []byte) (Sender, error) {
	switch path {
	case "generate":
		return newGenerateSender(messageID, data)
	case "validate":
		return newValidateSender(messageID, data)
	case "check":
		return newCheckSender(messageID, data)
	default:
		return judgeSender{messageID: messageID}, nil
	}
}

func (s judgeSender) Marshal(result json.RawMessage, taskErr error) ([]byte, error) {
	return NewJudgeResponse(s.messageID, result, taskErr).Marshal(), nil
}

func (s generateSender) Marshal(result json.RawMessage, taskErr error) ([]byte, error) {
	return NewGenerateResponse(s.messageID, s.problemID, result, taskErr).Marshal()
}

func (s validateSender) Marshal(result json.RawMessage, taskErr error) ([]byte, error) {
	return NewValidateResponse(s.messageID, s.problemID, result, taskErr).Marshal()
}

func (s checkSender) Marshal(result json.RawMessage, taskErr error) ([]byte, error) {
	return NewCheckResponse(s.messageID, s.problemID, result, taskErr).Marshal()
}

func newGenerateSender(messageID string, data []byte) (Sender, error) {
	problemID, err := problemIDFrom(data)
	return generateSender{messageID: messageID, problemID: problemID}, err
}

func newValidateSender(messageID string, data []byte) (Sender, error) {
	problemID, err := problemIDFrom(data)
	return validateSender{messageID: messageID, problemID: problemID}, err
}

func newCheckSender(messageID string, data []byte) (Sender, error) {
	problemID, err := problemIDFrom(data)
	return checkSender{messageID: messageID, problemID: problemID}, err
}

func problemIDFrom(data []byte) (int, error) {
	var request struct {
		ProblemID int `json:"problemId"`
	}
	if err := json.Unmarshal(data, &request); err != nil {
		return 0, err
	}
	return request.ProblemID, nil
}

func MarshalFallback(sender Sender, marshalErr error) ([]byte, error) {
	return sender.Marshal(nil, taskerror.New("router", taskerror.SERVER_ERROR, logger.ERROR, fmt.Errorf("marshal response: %w", marshalErr)))
}
