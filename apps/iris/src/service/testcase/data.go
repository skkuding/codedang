package testcase

import "github.com/skkuding/codedang/apps/iris/src/loader"

type Testcase struct {
	// metadata should be here
	Elements []loader.Element
}

func (t *Testcase) Count() int {
	return len(t.Elements)
}
