package sandbox

type Language string

func (l Language) IsValid() bool {
	switch l {
	case "C", "Cpp", "Java", "Python3":
		return true
	}
	return false
}

const (
	C      Language = "C"
	CPP    Language = "Cpp"
	JAVA   Language = "Java"
	PYTHON Language = "Python3"
)

type LangConfig[C any, E any] interface {
	GetConfig(language Language) (C, error)
	MakeSrcPath(dir string, language Language) (string, error)
	ToCompileExecArgs(dir string, language Language) (E, error)
	ToRunExecArgs(dir string, language Language, order int, limit Limit, fileIo bool) (E, error)
}

type Limit struct {
	CpuTime  int
	RealTime int
	Memory   int
}
