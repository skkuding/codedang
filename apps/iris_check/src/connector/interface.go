package connector

import "context"

type Connector interface {
	Connect(ctx context.Context)
	Disconnect()
}
