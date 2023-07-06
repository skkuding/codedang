package middleware

import "net/http"

// source: https://medium.com/@matryer/writing-middleware-in-golang-and-how-go-makes-it-so-much-fun-4375c1246e81

type Adapter func(http.Handler) http.Handler

func Adapt(h http.Handler, adapters ...Adapter) http.Handler {
	// 실행 순서는 전달된 adapters의 역순
	// a, b, c adapter가 순서대로 전달되었다면 다음 순서로 실행됨
	// c begin
	// b begin
	// a begin
	// h
	// a defer
	// b defer
	// c defer
	for _, adapter := range adapters {
		h = adapter(h)
	}
	return h
}
