package check

import "github.com/skkuding/codedang/apps/iris_check/src/loader"

type CheckResult struct {
	// metadata should be here
	Elements []loader.Element
}

func (t *CheckResult) Count() int {
	return len(t.Elements)
}
