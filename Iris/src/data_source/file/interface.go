package file

import datasource "github.com/cranemont/iris/src/data_source"

type FileDataSource interface {
	datasource.Read
}