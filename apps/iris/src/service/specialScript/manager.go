package specialScript

import (
	"github.com/skkuding/codedang/apps/iris/src/loader"
)

type SpecialScriptManager interface {
	GetSpecialScript(problemId string) (string, error)
}

type specialScriptManager struct {
	database loader.Read
}

func NewSpecialScriptManager(database loader.Read) *specialScriptManager {
	return &specialScriptManager{database: database}
}

func (t *specialScriptManager) GetSpecialScript(problemId string) (string, error) {
	// data, err := t.database.Get(problemId)
	// if err != nil {
	// 	return "", fmt.Errorf("GetSpecialScript: %w", err)
	// }

	return "#include <stdio.h> \n int main(void){ printf(\" helloworld \"); return 0;}", nil
}
