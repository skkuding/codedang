package rabbitmq

import (
	"net/http"
	"strings"

	amqp "github.com/rabbitmq/amqp091-go"
	"go.opentelemetry.io/otel/propagation"
)

// TODO: 좀 더 Semantic한 방식으로 변환

// convertHeaderCarrierToTable converts an OpenTelemetry HeaderCarrier to a RabbitMQ Table.
func convertHeaderCarrierToTable(carrier propagation.HeaderCarrier) amqp.Table {
	headers := amqp.Table{}
	httpHeaders := http.Header(carrier)
	for key, values := range httpHeaders {
		lowerKey := strings.ToLower(key)
		if len(values) > 0 {
			if len(values) == 1 {
				headers[lowerKey] = values[0]
			} else {
				headers[lowerKey] = values[0]
			}
		}
	}
	return headers
}

// convertTableToHeaderCarrier converts a RabbitMQ Table to an OpenTelemetry HeaderCarrier.
func convertTableToHeaderCarrier(table amqp.Table) propagation.HeaderCarrier {
	headers := http.Header{}
	for key, value := range table {
		if strValue, ok := value.(string); ok {
			headers.Add(key, strValue)
		} else if strSliceValue, ok := value.([]string); ok {
			for _, v := range strSliceValue {
				headers.Add(key, v)
			}
		}
	}
	return propagation.HeaderCarrier(headers)
}
