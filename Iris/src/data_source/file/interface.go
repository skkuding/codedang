package file

import datasource "github.com/skkuding/codedang/iris/src/data_source"

type FileDataSource interface {
	datasource.Read
}
