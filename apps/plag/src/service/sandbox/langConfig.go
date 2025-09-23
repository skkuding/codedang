package sandbox

type Language string

func (l Language) GetLangExt() string {
  switch l {
    case C: return "c"
    case CPP: return "cpp"
    case JAVA: return "java"
    case PYTHON: return "py"
    case PYPY: return "pypy3"
    default: return ""
  }
}

func (l Language) IsValid() bool {
	switch l {
	case "C", "Cpp", "Java", "Python3", "PyPy3":
		return true
	}
	return false
}

const (
	C      Language = "C"
	CPP    Language = "Cpp"
	JAVA   Language = "Java"
	PYTHON Language = "Python3"
	PYPY   Language = "PyPy3"
)
