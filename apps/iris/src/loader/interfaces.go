package loader

type Read interface {
	Get(key string) ([]byte, error)
}

type Write interface {
	Set(key string, value interface{}) error
}

type ReadWrite interface {
	Read
	Write
}
