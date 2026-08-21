package response

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/skkuding/codedang/apps/iris/src/common/constants"
	"github.com/skkuding/codedang/apps/iris/src/common/taskerror"
	"github.com/skkuding/codedang/apps/iris/src/common/taskresult"
	"github.com/skkuding/codedang/apps/iris/src/service/logger"
)

type encoder interface {
	Marshal(result json.RawMessage, taskErr error) ([]byte, error)
	MessageType() string
}

// Sender owns response encoding and cancellation-aware delivery for one routed message.
type Sender struct {
	ctx       context.Context
	out       chan<- Response
	path      string
	messageID string
	encoder   encoder
	logger    logger.Logger
}

type judgeEncoder struct {
	messageID   string
	messageType string
}
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
func NewSender(ctx context.Context, out chan<- Response, path, messageID string, data []byte, logger logger.Logger) (*Sender, error) {
	encoder, err := newEncoder(path, messageID, data)
	if encoder == nil {
		return nil, err
	}
	return &Sender{ctx: ctx, out: out, path: path, messageID: messageID, encoder: encoder, logger: logger}, err
}

func newEncoder(path, messageID string, data []byte) (encoder, error) {
	switch path {
	case constants.Judge, constants.SpecialJudge, constants.Run, constants.UserTestCase:
		return judgeEncoder{messageID: messageID, messageType: path}, nil
	case constants.Generate:
		return newGenerateEncoder(messageID, data)
	case constants.Validate:
		return newValidateEncoder(messageID, data)
	case constants.Check:
		return newCheckEncoder(messageID, data)
	default:
		return nil, fmt.Errorf("unsupported response path: %s", path)
	}
}

func (s *Sender) Send(result taskresult.Message, messageType ...any) bool {
	typeName := s.responseType(messageType...)
	if result.EncodedResponse != nil {
		return s.deliver(Response{Message: result.EncodedResponse, Type: typeName})
	}

	data, err := s.encoder.Marshal(result.Result, result.Err)
	if err == nil {
		return s.deliver(Response{Message: data, Type: typeName})
	}

	s.logger.Log(logger.ERROR, fmt.Sprintf("failed to marshal response for path %s with id %s: %v", s.path, s.messageID, err))
	fallback, fallbackErr := marshalFallback(s.encoder, err)
	if fallbackErr != nil {
		s.logger.Log(logger.ERROR, fmt.Sprintf("failed to marshal fallback response for path %s with id %s: %v", s.path, s.messageID, fallbackErr))
		return false
	}
	return s.deliver(Response{Message: fallback, Type: typeName})
}

func (s *Sender) responseType(messageType ...any) string {
	if len(messageType) == 0 {
		return s.encoder.MessageType()
	}

	typeName, ok := messageType[0].(string)
	if !ok || typeName == "" {
		s.logger.Log(logger.WARN, fmt.Sprintf("invalid response type for path %s with id %s; using sender type", s.path, s.messageID))
		return s.encoder.MessageType()
	}
	return typeName
}

func (s *Sender) deliver(data Response) bool {
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

func (s judgeEncoder) MessageType() string { return s.messageType }

func (s generateEncoder) Marshal(result json.RawMessage, taskErr error) ([]byte, error) {
	return NewGenerateResponse(s.messageID, s.problemID, result, taskErr).Marshal()
}

func (s generateEncoder) MessageType() string { return constants.Generate }

func (s validateEncoder) Marshal(result json.RawMessage, taskErr error) ([]byte, error) {
	return NewValidateResponse(s.messageID, s.problemID, result, taskErr).Marshal()
}

func (s validateEncoder) MessageType() string { return constants.Validate }

func (s checkEncoder) Marshal(result json.RawMessage, taskErr error) ([]byte, error) {
	return NewCheckResponse(s.messageID, s.problemID, result, taskErr).Marshal()
}

func (s checkEncoder) MessageType() string { return constants.Check }

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
