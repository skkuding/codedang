package sandbox

type Compiler interface {
	Compile(dto CompileRequest) (CompileResult, error)
}

type CompileResult struct {
	ErrOutput  string     // compile error message
	ExecResult ExecResult // resource usage and metadata from sandbox
}

type CompileRequest struct {
	Dir      string
	Language Language
}
