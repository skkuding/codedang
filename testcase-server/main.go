package main

import (
	"net/http"

	"github.com/skkuding/codedang/testcase-server/handler"
	"github.com/skkuding/codedang/testcase-server/handler/response"
	"github.com/skkuding/codedang/testcase-server/middleware"
	"github.com/skkuding/codedang/testcase-server/router"
	"github.com/skkuding/codedang/testcase-server/router/method"
	"github.com/skkuding/codedang/testcase-server/utils"
)

func main() {
	r := router.NewRouter()
	responser := response.NewResponser()
	testcaseHandler := handler.NewTestcaseHandler(responser)

	r.Handle(method.GET, "/problem/:id/testcase",
		middleware.Adapt(
			testcaseHandler,
			middleware.SetJsonContentType(),
		),
	)

	port := utils.Getenv("PORT", "30000")
	host := utils.Getenv("HOST", "")

	http.ListenAndServe(host+":"+port, r)
}
