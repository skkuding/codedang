package router

import (
	"context"
	"net/http"
	"strings"

	hm "github.com/cranemont/iris/tests/testcase-server/router/method"
)

type router struct {
	handler map[string]map[string]http.Handler
}

func NewRouter() *router {
	return &router{
		handler: make(map[string]map[string]http.Handler),
	}
}

func (r *router) Handle(method hm.HttpMethoder, pattern string, handler http.Handler) {
	m := method.HttpMethod().ToString()
	if _, ok := r.handler[m]; !ok {
		r.handler[m] = make(map[string]http.Handler)
	}
	r.handler[m][pattern] = handler
}

func (r *router) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	for pattern, handler := range r.handler[req.Method] {
		if params, ok := match(pattern, req.URL.Path); ok {
			ctx := context.WithValue(req.Context(), "params", params)
			handler.ServeHTTP(w, req.WithContext(ctx))
			return
		}
	}
	http.NotFound(w, req)
}

func match(pattern, path string) (map[string]string, bool) {
	if pattern == path {
		return nil, true
	}

	patterns := strings.Split(pattern, "/")
	paths := strings.Split(path, "/")
	params := make(map[string]string)

	for idx, p := range patterns {
		switch {
		case p == paths[idx]:
		case len(p) > 1 && p[0] == ':':
			params[p[1:]] = paths[idx]
		default:
			return nil, false
		}
	}
	return params, true
}
