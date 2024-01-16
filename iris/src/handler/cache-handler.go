package handler

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/skkuding/codedang/iris/src/loader/cache"
	"github.com/skkuding/codedang/iris/src/service/logger"
)

type CacheRequest struct {
	Action    string `json:"action"`
	ProblemId int    `json:"problemId"`
}

const EVICT = "evict"

func (c CacheRequest) Validate() (*CacheRequest, error) {
	if c.Action == "" {
		return nil, fmt.Errorf("action must not be empty")
	}
	if c.Action != EVICT {
		return nil, fmt.Errorf("unsupported action")
	}
	if c.ProblemId <= 0 {
		return nil, fmt.Errorf("problemId must not be empty or zero")
	}
	return &c, nil
}

type CacheResult struct {
	ProblemId int    `json:"problemId"`
	ErrorCode int    `json:"errorCode"`
	Error     string `json:"error"`
}

func (c *CacheResult) SetCacheResult(problemId int, errorCode int) {
	c.ProblemId = problemId
	c.ErrorCode = errorCode
}

func (c *CacheResult) Marshal() (json.RawMessage, error) {
	if res, err := json.Marshal(c); err != nil {
		return nil, &HandlerError{caller: "cache-handler", err: fmt.Errorf("marshaling result: %w", err)}
	} else {
		return res, nil
	}
}

type CacheResultCode int8

const (
	EVICTED = 0 + iota
	EVICT_FAILED
	UNSUPPORTED
)

type CacheHandler struct {
	cache  cache.Cache
	logger logger.Logger
}

func NewCacheHandler(
	cache cache.Cache,
	logger logger.Logger,
) *CacheHandler {
	return &CacheHandler{
		cache,
		logger,
	}
}

func (c *CacheHandler) Handle(id string, data []byte) (json.RawMessage, error) {

	startedAt := time.Now()
	defer func() {
		c.logger.Log(logger.DEBUG, fmt.Sprintf("task done: total time: %s", time.Since(startedAt)))
	}()

	req := CacheRequest{}
	res := CacheResult{}

	err := json.Unmarshal(data, &req)
	if err != nil {
		return nil, &HandlerError{
			caller:  "handle",
			err:     fmt.Errorf("%w: %s", ErrValidate, err),
			level:   logger.ERROR,
			Message: err.Error(),
		}
	}
	validReq, err := req.Validate()
	if err != nil {
		return nil, &HandlerError{
			caller:  "request validate",
			err:     fmt.Errorf("%w: %s", ErrValidate, err),
			level:   logger.ERROR,
			Message: err.Error(),
		}
	}

	switch validReq.Action {
	case EVICT:
		if err := c.cache.Evict(fmt.Sprint(validReq.ProblemId)); err != nil {
			return nil, &HandlerError{
				caller: "handle",
				err:    err,
			}
		}
		res.ErrorCode = EVICTED
	default:
		res.Error = fmt.Sprintf("unsupported action %s", validReq.Action)
		res.ErrorCode = UNSUPPORTED
	}

	res.ProblemId = validReq.ProblemId
	marshaledRes, err := json.Marshal(res)
	if err != nil {
		return nil, &HandlerError{err: ErrMarshalJson, level: logger.ERROR}
	}
	return marshaledRes, err
}
