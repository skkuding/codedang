package cache

import datasource "github.com/cranemont/iris/src/data_source"

type Cache interface {
	datasource.ReadWrite
	IsExist(key string) (bool, error)
}