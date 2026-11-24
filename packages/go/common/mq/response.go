package mq

// Response carries an application-encoded response and its message type.
type Response struct {
	Message []byte
	Type    string
}
