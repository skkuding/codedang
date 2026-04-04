package handler

import "errors"

func ExtractUserMessage(err error) string {
	var te *TaskError
	if errors.As(err, &te) && te.UserMsg != "" {
		return te.UserMsg
	}
	return ""
}

func ExtractResultCode(err error) ResultCode {
	var te *TaskError
	if errors.As(err, &te) {
		return te.Code
	}
	return SERVER_ERROR
}
