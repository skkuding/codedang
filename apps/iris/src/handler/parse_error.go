package handler

import "github.com/skkuding/codedang/apps/iris/src/common/taskerror"

func ParseError(res any, resultCode ResultCode) error {
	return taskerror.Parse(res, resultCode)
}
