package sandbox

type Sandbox[C any, E any] interface {
	Compiler
	Runner
	LangConfig[C, E]
}

type ExecResult struct {
	CpuTime    int        `json:"cpu_time"`
	RealTime   int        `json:"real_time"`
	Memory     int        `json:"memory"`
	Signal     int        `json:"signal"`
	ExitCode   int        `json:"exit_code"`
	ErrorCode  int        `json:"error"`
	StatusCode StatusCode `json:"result"`
	CgroupPath string     `json:"cgroup_path"`
}
