package httpserver

import datasource "github.com/skkuding/codedang/iris/src/data_source"

type HttpServerDataSource interface {
	datasource.Read
}
