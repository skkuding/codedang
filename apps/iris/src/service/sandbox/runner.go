package sandbox

type Runner interface {
	Run(req RunRequest, input []byte) (RunResult, error)
}
type RunResult struct {
	Order      int
	ErrOutput  []byte
	Output     []byte
	ExecResult ExecResult
}

type RunRequest struct {
	Order       int
	Dir         string
	Language    Language
	TimeLimit   int
	MemoryLimit int
}
