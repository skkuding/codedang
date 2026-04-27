package handler

import (
	"context"

	"github.com/skkuding/codedang/apps/iris/src/service/build"
)

type Task interface {
	GetBuildUnits() []*build.BuildUnit
	GetDebugString() string
	RunAction(ctx context.Context, resultSender ResultSender2Runner)
}
