package middleware

import (
	"fmt"
	"net/http"
)

func Example(n int) Adapter {
	return func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// http.HandlerFunc의 ServeHTTP는 HandlerFunc 자체를 호출함(net/http의 HandlerFunc 참조)
			// 여기서 반환하는 값이 http.HandlerFunc 타입으로 변환한 익명 함수이므로
			// Adapt함수로 middleware를 중첩시키면 아래 h.ServeHTTP(w, req)는
			// 이전의 middleware에서 반환한 익명 함수를 호출함
			// middleware들이 다 처리되면 처음 전달된 실제 handler구현체가 실행됨
			fmt.Println("before", n)
			h.ServeHTTP(w, r)
			fmt.Println("after", n)
		})
	}
}
