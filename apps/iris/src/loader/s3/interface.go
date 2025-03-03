package s3

import "github.com/skkuding/codedang/apps/iris/src/loader"

type HttpServerDataSource interface {
	loader.Read
}
