package method

type httpMethod string

const (
	GET    httpMethod = "GET"
	POST   httpMethod = "POST"
	PUT    httpMethod = "PUT"
	DELETE httpMethod = "DELETE"
)

type HttpMethoder interface {
	HttpMethod() httpMethod
}

func (h httpMethod) HttpMethod() httpMethod {
	return h
}

func (h httpMethod) ToString() string {
	return string(h)
}
