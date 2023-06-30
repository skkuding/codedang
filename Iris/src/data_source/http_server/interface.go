package httpserver

import datasource "github.com/cranemont/iris/src/data_source"

type HttpServerDataSource interface {
	datasource.Read
}
