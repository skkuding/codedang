package response

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/skkuding/codedang/apps/iris/src/common/taskerror"
	"github.com/skkuding/codedang/apps/iris/src/common/taskresult"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
)

type encoder interface {
	Marshal(result json.RawMessage, taskErr error) ([]byte, error)
}

// Sender owns response encoding and cancellation-aware delivery for one routed message.
type Sender struct {
	ctx       context.Context
	out       chan<- []byte
	path      string
	messageID string
	encoder   encoder
	logger    logger.Logger
}

type judgeEncoder struct{ messageID string }
type generateEncoder struct {
	messageID string
	problemID int
}
type validateEncoder struct {
	messageID string
	problemID int
}
type checkEncoder struct {
	messageID string
	problemID int
}

// NewSender selects the response contract and owns delivery for one message.
// problemId belongs only to tool contracts and is extracted by those encoders.
func NewSender(ctx context.Context, out chan<- []byte, path, messageID string, data []byte, logger logger.Logger) (*Sender, error) {
	encoder, err := newEncoder(path, messageID, data)
	if encoder == nil {
		return nil, err
	}
	return &Sender{ctx: ctx, out: out, path: path, messageID: messageID, encoder: encoder, logger: logger}, err
}

func newEncoder(path, messageID string, data []byte) (encoder, error) {
	switch path {
	case "judge", "specialJudge", "run", "userTestCase":
		return judgeEncoder{messageID: messageID}, nil
	case "generate":
		return newGenerateEncoder(messageID, data)
	case "validate":
		return newValidateEncoder(messageID, data)
	case "check":
		return newCheckEncoder(messageID, data)
	default:
		return nil, fmt.Errorf("unsupported response path: %s", path)
	}
}

func (s *Sender) Send(result taskresult.Message) bool {
	if result.EncodedResponse != nil {
		return s.deliver(result.EncodedResponse)
	}

	data, err := s.encoder.Marshal(result.Result, result.Err)
	if err == nil {
		return s.deliver(data)
	}

	s.logger.Log(logger.ERROR, fmt.Sprintf("failed to marshal response for path %s with id %s: %v", s.path, s.messageID, err))
	fallback, fallbackErr := marshalFallback(s.encoder, err)
	if fallbackErr != nil {
		s.logger.Log(logger.ERROR, fmt.Sprintf("failed to marshal fallback response for path %s with id %s: %v", s.path, s.messageID, fallbackErr))
		return false
	}
	return s.deliver(fallback)
}

func (s *Sender) deliver(data []byte) bool {
	select {
	case s.out <- data:
		return true
	case <-s.ctx.Done():
		return false
	}
}

func (s judgeEncoder) Marshal(result json.RawMessage, taskErr error) ([]byte, error) {
	return NewJudgeResponse(s.messageID, result, taskErr).Marshal(), nil
}

func (s generateEncoder) Marshal(result json.RawMessage, taskErr error) ([]byte, error) {
	return NewGenerateResponse(s.messageID, s.problemID, result, taskErr).Marshal()
}

func (s validateEncoder) Marshal(result json.RawMessage, taskErr error) ([]byte, error) {
	return NewValidateResponse(s.messageID, s.problemID, result, taskErr).Marshal()
}

func (s checkEncoder) Marshal(result json.RawMessage, taskErr error) ([]byte, error) {
	return NewCheckResponse(s.messageID, s.problemID, result, taskErr).Marshal()
}

func newGenerateEncoder(messageID string, data []byte) (encoder, error) {
	problemID, err := problemIDFrom(data)
	return generateEncoder{messageID: messageID, problemID: problemID}, err
}

func newValidateEncoder(messageID string, data []byte) (encoder, error) {
	problemID, err := problemIDFrom(data)
	return validateEncoder{messageID: messageID, problemID: problemID}, err
}

func newCheckEncoder(messageID string, data []byte) (encoder, error) {
	problemID, err := problemIDFrom(data)
	return checkEncoder{messageID: messageID, problemID: problemID}, err
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

func marshalFallback(encoder encoder, marshalErr error) ([]byte, error) {
	return encoder.Marshal(nil, taskerror.New("router", taskerror.SERVER_ERROR, logger.ERROR, fmt.Errorf("marshal response: %w", marshalErr)))
}
