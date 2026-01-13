package testcase

type TestcaseFilterCode int8

const (
	ALL TestcaseFilterCode = 0 + iota
	PUBLIC_ONLY
	HIDDEN_ONLY
)
