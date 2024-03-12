package cache

import "github.com/skkuding/codedang/apps/iris/src/loader"

type Cache interface {
	loader.ReadWrite
	IsExist(key string) (bool, error)
}
