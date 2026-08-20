package handler

import "github.com/skkuding/codedang/apps/iris/src/common/taskresult"

type ResultMessage = taskresult.Message

// ResultSender delivers a task result to the caller-provided result sink.
// The sender does not own the underlying channel or its lifecycle.
type ResultSender func(ResultMessage)
