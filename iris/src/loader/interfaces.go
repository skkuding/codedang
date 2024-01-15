package loader

type Read interface {
	Get(key string) ([]byte, error)
}

type Write interface {
	Set(key string, value interface{}) error
}

type Evict interface {
	Evict(key string) error
}

type CRUD interface {
	Read
	Write
	Evict
}
