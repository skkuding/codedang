package handler

type SandboxAdapter interface {
	Compile(source string) error
	Run(executable string) error
	GetConfig(language string) (interface{}, error)
	GetExecutionEnv(language string) (interface{}, error)
}
