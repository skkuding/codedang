package rabbitmq

import (
	"reflect"
	"testing"

	amqp "github.com/rabbitmq/amqp091-go"
	"go.opentelemetry.io/otel/propagation"
)

func TestConvertTableToHeaderCarrier(t *testing.T) {
	tests := []struct {
		name  string
		input amqp.Table
		want  propagation.HeaderCarrier
	}{
		{
			name:  "string",
			input: amqp.Table{"Name": "iris"},
			want:  propagation.HeaderCarrier{"Name": {"iris"}},
		},
		{
			name:  "string_slice",
			input: amqp.Table{"Tags": []string{"A", "B", "A"}},
			want:  propagation.HeaderCarrier{"Tags": {"A", "B", "A"}},
		},
		{
			name: "unsupported_types",
			input: amqp.Table{
				"Count":   int32(123),
				"Enabled": true,
				"Data":    []byte("hello"),
				"Values":  []any{"A", "B"},
				"Null":    nil,
			},
			want: propagation.HeaderCarrier{},
		},
		{
			name:  "mixed_types",
			input: amqp.Table{"Name": "iris", "Tags": []string{"A", "B"}, "Count": int32(123)},
			want:  propagation.HeaderCarrier{"Name": {"iris"}, "Tags": {"A", "B"}},
		},
		{
			name:  "empty_table",
			input: amqp.Table{},
			want:  propagation.HeaderCarrier{},
		},
		{
			name:  "nil_table",
			input: nil,
			want:  propagation.HeaderCarrier{},
		},
		{
			name:  "empty_string_slices",
			input: amqp.Table{"Tags": []string{}, "Values": []string(nil)},
			want:  propagation.HeaderCarrier{},
		},
		{
			name:  "canonical_header_keys",
			input: amqp.Table{"content-type": "application/json", "TRACEPARENT": "trace-value"},
			want:  propagation.HeaderCarrier{"Content-Type": {"application/json"}, "Traceparent": {"trace-value"}},
		},
		{
			name:  "empty_string",
			input: amqp.Table{"Name": ""},
			want:  propagation.HeaderCarrier{"Name": {""}},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := convertTableToHeaderCarrier(tt.input)
			if !reflect.DeepEqual(got, tt.want) {
				t.Fatalf("convertTableToHeaderCarrier(%#v) = %#v, want %#v", tt.input, got, tt.want)
			}
		})
	}
}

func TestConvertHeaderCarrierToTable(t *testing.T) {
	tests := []struct {
		name  string
		input propagation.HeaderCarrier
		want  amqp.Table
	}{
		{
			name:  "single_value_lowercase_key",
			input: propagation.HeaderCarrier{"Traceparent": {"A"}},
			want:  amqp.Table{"traceparent": "A"},
		},
		{
			name:  "multiple_values_use_first",
			input: propagation.HeaderCarrier{"Baggage": {"A", "B"}},
			want:  amqp.Table{"baggage": "A"},
		},
		{
			name:  "empty_values_omitted",
			input: propagation.HeaderCarrier{"Empty": {}},
			want:  amqp.Table{},
		},
		{
			name:  "empty_carrier",
			input: propagation.HeaderCarrier{},
			want:  amqp.Table{},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := convertHeaderCarrierToTable(tt.input)
			if !reflect.DeepEqual(got, tt.want) {
				t.Fatalf("convertHeaderCarrierToTable(%#v) = %#v, want %#v", tt.input, got, tt.want)
			}
		})
	}
}
