package loader

type Read interface {
	Get(key string) ([]Element, error)
}
