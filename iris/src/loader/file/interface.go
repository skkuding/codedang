package file

import "github.com/skkuding/codedang/iris/src/loader"

type FileDataSource interface {
	loader.Read
}
