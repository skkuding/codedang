package handler

import "github.com/skkuding/codedang/apps/iris/src/common/taskerror"

func ExtractUserMessage(err error) string {
	return taskerror.ExtractUserMessage(err)
}

func ExtractResultCode(err error) ResultCode {
	return taskerror.ExtractResultCode(err)
}
