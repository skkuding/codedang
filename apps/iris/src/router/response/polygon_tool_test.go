package response

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestPolygonToolResponseMarshalReturnsInvalidRawMessageError(t *testing.T) {
	res := NewPolygonToolResponse("message", 1, "generator", json.RawMessage("{"), nil)

	_, err := res.Marshal()

	assert.Error(t, err)
}
