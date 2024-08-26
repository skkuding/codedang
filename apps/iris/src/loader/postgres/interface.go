package postgres

import "github.com/skkuding/codedang/apps/iris/src/loader"

type PostgresDataSource interface {
	loader.Read
}
