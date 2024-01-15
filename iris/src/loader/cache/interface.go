package cache

import "github.com/skkuding/codedang/iris/src/loader"

type Cache interface {
	loader.CRUD
	IsExist(key string) (bool, error)
}
