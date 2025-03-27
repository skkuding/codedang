package rabbitmq

import (
	"net/http"

	amqp "github.com/rabbitmq/amqp091-go"
	"go.opentelemetry.io/otel/propagation"
)

// convertHeaderCarrierToTable converts an OpenTelemetry HeaderCarrier to a RabbitMQ Table.
func convertHeaderCarrierToTable(carrier propagation.HeaderCarrier) amqp.Table {
	headers := amqp.Table{}
	httpHeaders := http.Header(carrier)
	for key, values := range httpHeaders {
		if len(values) > 0 {
			if len(values) == 1 {
				headers[key] = values[0]
			} else {
				headers[key] = values
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
