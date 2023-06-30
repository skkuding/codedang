package handler

import (
	"log"
	"net/http"
	"os"

	"github.com/cranemont/iris/tests/testcase-server/handler/response"
	"github.com/cranemont/iris/tests/testcase-server/utils"
)

type testcase struct {
	r response.Responser
}

func NewTestcaseHandler(r response.Responser) *testcase {
	return &testcase{r}
}

func (t *testcase) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	params, _ := req.Context().Value("params").(map[string]string)

	// FIXME: 테스트 가능한 구조로 분리
	path := utils.Getenv("TESTCASE_PATH", "./data")
	data, err := os.ReadFile(path + "/" + params["id"] + ".json")
	if err != nil {
		log.Println("TestcaseHandler: ServeHttp:", err)
	}
	if err != nil {
		t.r.Error(w, "failed to read testcase file", http.StatusNotFound)
		return
	}

	t.r.Ok(w, data, http.StatusOK)
}
