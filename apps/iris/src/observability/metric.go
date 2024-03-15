package observability

import (
	"context"
	"os"
	"runtime"
	"time"

	"github.com/shirou/gopsutil/cpu"
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
		reportErr(err, "failed to create metric resource")
	}

	// Create a meter provider.
	// You can pass this instance directly to your instrumented code if it
	// accepts a MeterProvider instance.
	meterProvider, err := newMeterProvider(res, defaultMetricDuration)
	if err != nil {
		reportErr(err, "failed to create metric provider")
	}

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
	entryPoint := os.Getenv("OTEL_EXPORTER_OTLP_ENDPOINT")
	otlpExporter, err := otlpmetrichttp.New(context.Background(), otlpmetrichttp.WithEndpointURL("http://"+entryPoint+"/v1/metrics"))
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
func GetMemoryMeter(meter metric.Meter) {
	if _, err := meter.Int64ObservableGauge(
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
	); err != nil {
		reportErr(err, "failed to create memory meter")
	}
}

func GetCPUMeter(meter metric.Meter, duration time.Duration) {
	// 일단 전체 CPU Usage를 추적합니다.
	// 추후에, CPU별로 Usage 추적이 필요할 경우 true로 설정합니다.

	//Cpu시간을 cpu.comman함수로 ctx를 중지시키고, Duration 차이에 해당하는 CPU time의 차를 계산합니다.
	// busy := t.User + t.System + t.Nice + t.Iowait + t.Irq + t.Softirq + t.Steal 시간의 전체를 CPU usage 계산에 사용합니다.
	if _, err := meter.Float64ObservableGauge(
		"cpu.usage",
		metric.WithDescription(
			"All CPU",
		),
		metric.WithUnit("%"),
		metric.WithFloat64Callback(func(_ context.Context, o metric.Float64Observer) error {
			cpuPercent, _ := cpu.Percent(duration, false)
			o.Observe(float64(cpuPercent[0]))
			return nil
		}),
	); err != nil {
		reportErr(err, "failed to create CPU meter")
	}
}
