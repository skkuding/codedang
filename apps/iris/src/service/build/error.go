package build

import "fmt"

type BuildUnitError struct {
	Unit        string
	Phase       string
	UserMsg     string
	IsUserError bool
	Err         error
}

func (e *BuildUnitError) Error() string {
	return fmt.Sprintf("[%s/%s] %s", e.Unit, e.Phase, e.Err)
}

func (e *BuildUnitError) Unwrap() error {
	return e.Err
}
