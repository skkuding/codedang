package check

import "github.com/skkuding/codedang/apps/iris_check/src/loader"

type CheckInput struct {
	// metadata should be here
  BaseCode string
  HasBase bool
	Elements []loader.Element
}

func (s *CheckInput) Count() int {
	return len(s.Elements)
}
