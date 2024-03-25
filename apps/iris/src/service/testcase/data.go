package testcase

import (
	"encoding/json"
)

type Element struct {
	Id  string `json:"id"`
	In  string `json:"input"`
	Out string `json:"output"`
}

type Testcase struct {
	// metadata should be here
	Elements []Element
}

func (t *Testcase) Count() int {
	return len(t.Elements)
}

func (t Testcase) MarshalBinary() ([]byte, error) {
	return json.Marshal(t)
}

func (t *Testcase) UnmarshalBinary(data []byte) error {
	return json.Unmarshal(data, &t)
}
