package handler

import (
	"context"

	"github.com/skkuding/codedang/apps/iris/src/service/build"
)

type Task interface {
	GetBuildUnits() []*build.BuildUnit
	GetDebugString() string
	RunAction(ctx context.Context, messageID string, resultSender ResultSender)
}

// SetupFailureResponder emits the response sequence required when build setup
// fails before RunAction can produce its normal final response.
type SetupFailureResponder interface {
	SendSetupFailure(messageID string, taskErr error, resultSender ResultSender)
}
