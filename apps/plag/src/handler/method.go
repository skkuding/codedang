package handler

type requestMethod uint8

const (
	methodWorkbook requestMethod = 1 << iota
	methodContest
	methodAssignments
)
