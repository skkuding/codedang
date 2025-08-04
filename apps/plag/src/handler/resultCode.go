package handler

type ResultCode int8

const (
	CHECKED ResultCode = 0 + iota
	SERVER_ERROR
	CANCELED
)
