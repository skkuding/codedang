package handler

type ResultCode int8

const (
	CHECKED ResultCode = 0 + iota
  JPLAG_ERROR
  TOKEN_ERROR
	SERVER_ERROR
)
