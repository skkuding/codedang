package observability

import (
	"context"
	"log"
	"runtime"
	"time"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp"
	"go.opentelemetry.io/otel/metric"
	sdkmetric "go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/resource"
	semconv "go.opentelemetry.io/otel/semconv/v1.24.0"
)

const defaultMetricDuration time.Duration = 3 * time.Second

func SetGlobalMeterProvider() {
	// Create resource.
	res, err := newMetricResource()
	if err != nil {
		panic(err)
	}

	// Create a meter provider.
	// You can pass this instance directly to your instrumented code if it
	// accepts a MeterProvider instance.
	meterProvider, err := newMeterProvider(res, defaultMetricDuration)
	if err != nil {
		panic(err)
	}

	// Handle shutdown properly so nothing leaks.
	defer func() {
		if err := meterProvider.Shutdown(context.Background()); err != nil {
			log.Println(err)
		}
	}()

	// Register as global meter provider so that it can be used via otel.Meter
	// and accessed using otel.GetMeterProvider.
	// Most instrumentation libraries use the global meter provider as default.
	// If the global meter provider is not set then a no-op implementation
	// is used, which fails to generate data.
	otel.SetMeterProvider(meterProvider)
}

func newMetricResource() (*resource.Resource, error) {
	return resource.Merge(resource.Default(),
		resource.NewWithAttributes(semconv.SchemaURL,
			semconv.ServiceName("iris-metric"),
			semconv.ServiceVersion("0.1.0"),
		))
}

func newMeterProvider(res *resource.Resource, second time.Duration) (*sdkmetric.MeterProvider, error) {
	// Use OLTP Exporter for Grafana Agent (Recommended)
	otlpExporter, err := otlpmetrichttp.New(context.Background(), otlpmetrichttp.WithEndpointURL("http://localhost:4318/v1/metrics"))
	if err != nil {
		return nil, err
	}

	meterProvider := sdkmetric.NewMeterProvider(
		sdkmetric.WithResource(res),
		sdkmetric.WithReader(sdkmetric.NewPeriodicReader(otlpExporter,
			// Define duration of Metric
			sdkmetric.WithInterval(second))),
	)
	return meterProvider, nil
}

// TODO - Int64ObservableGauge를 Meter로 추상화할 수 있었으면 합니다.
func GetMemoryMeter(meter metric.Meter) (metric.Int64ObservableGauge, error) {
	memoryMeter, err := meter.Int64ObservableGauge(
		"memory.heap",
		metric.WithDescription(
			"Memory usage of the allocated heap objects.",
		),
		metric.WithUnit("By"), // UCUM 규약의 Byte
		metric.WithInt64Callback(func(_ context.Context, o metric.Int64Observer) error {
			var m runtime.MemStats
			runtime.ReadMemStats(&m)
			o.Observe(int64(m.HeapAlloc))
			return nil
		}),
	)
	if err != nil {
		panic(err)
	}
	return memoryMeter, err
}
