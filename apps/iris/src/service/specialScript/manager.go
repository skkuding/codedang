package specialScript

import (
	"github.com/skkuding/codedang/apps/iris/src/loader"
)

type SpecialScriptManager interface {
	GetSpecialScript(problemId string) (SpecialScript, error)
}

type specialScriptManager struct {
	database loader.Read
}

func NewSpecialScriptManager(database loader.Read) *specialScriptManager {
	return &specialScriptManager{database: database}
}

func (t *specialScriptManager) GetSpecialScript(problemId string) (SpecialScript, error) {
	// data, err := t.database.Get(problemId)
	// if err != nil {
	// 	return "", fmt.Errorf("GetSpecialScript: %w", err)
	// }

	return "helloworld", nil
}
