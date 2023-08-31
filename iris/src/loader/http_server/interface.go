package httpserver

import "github.com/skkuding/codedang/iris/src/loader"

type HttpServerDataSource interface {
	loader.Read
}
