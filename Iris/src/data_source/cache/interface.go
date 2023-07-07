package cache

import datasource "github.com/skkuding/codedang/iris/src/data_source"

type Cache interface {
	datasource.ReadWrite
	IsExist(key string) (bool, error)
}
