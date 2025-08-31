// internal/instrumentation/instrumentation.go
package instrumentation

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"
	"runtime"
	"strings"
	"sync"
	"time"

	"github.com/shirou/gopsutil/cpu"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploggrpc"
	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
	"go.opentelemetry.io/otel/log/global"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/propagation"
	otel_log "go.opentelemetry.io/otel/sdk/log"
	otel_metric "go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/resource"
	"go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.26.0"
)

var (
	initOnce       sync.Once
	shutdownFuncs  []func(context.Context) error
	tracerProvider *trace.TracerProvider
	meterProvider  *otel_metric.MeterProvider
	loggerProvider *otel_log.LoggerProvider
)

func newResource(ctx context.Context, serviceName, serviceVersion string) (*resource.Resource, error) {
	appEnv := strings.ToLower(os.Getenv("APP_ENV"))
	attrs := []resource.Option{
		resource.WithAttributes(
			semconv.ServiceName(serviceName),
			semconv.ServiceVersion(serviceVersion),
			semconv.DeploymentEnvironment(appEnv),
		),
		resource.WithProcess(),
		resource.WithHost(),
		resource.WithContainer(),
		resource.WithOS(),
		resource.WithTelemetrySDK(),
	}

	res, err := resource.New(ctx, attrs...)
	if err != nil {
		return nil, fmt.Errorf("failed to create resource: %w", err)
	}
	return res, nil
}

func Init(ctx context.Context, serviceName, serviceVersion, otlpEndpoint string) (shutdown func(context.Context) error, err error) {
	initOnce.Do(func() {
		res, rErr := newResource(ctx, serviceName, serviceVersion)
		if rErr != nil {
			err = fmt.Errorf("failed to initialize resource: %w", rErr)
			return
		}

		// Trace
		traceExporter, trExpErr := otlptracegrpc.New(ctx, otlptracegrpc.WithEndpoint(otlpEndpoint), otlptracegrpc.WithInsecure())
		if trExpErr != nil {
			err = fmt.Errorf("trace exporter: %w", trExpErr)
			return
		}
		bsp := trace.NewBatchSpanProcessor(traceExporter)
		tracerProvider = trace.NewTracerProvider(trace.WithResource(res), trace.WithSpanProcessor(bsp))
		otel.SetTracerProvider(tracerProvider)
		shutdownFuncs = append(shutdownFuncs, tracerProvider.Shutdown)

		// Metric
		metricExporter, mExpErr := otlpmetricgrpc.New(ctx, otlpmetricgrpc.WithEndpoint(otlpEndpoint), otlpmetricgrpc.WithInsecure())
		if mExpErr != nil {
			err = fmt.Errorf("metric exporter: %w", mExpErr)
			return
		}
		metricReader := otel_metric.NewPeriodicReader(metricExporter, otel_metric.WithInterval(3*time.Second))
		meterProvider = otel_metric.NewMeterProvider(otel_metric.WithResource(res), otel_metric.WithReader(metricReader))
		otel.SetMeterProvider(meterProvider)
		shutdownFuncs = append(shutdownFuncs, meterProvider.Shutdown)

		// Log
		logExporter, lExpErr := otlploggrpc.New(ctx, otlploggrpc.WithEndpoint(otlpEndpoint), otlploggrpc.WithInsecure())
		if lExpErr != nil {
			err = fmt.Errorf("failed to create OTLP log exporter: %w", lExpErr)
			return
		}
		lbp := otel_log.NewBatchProcessor(logExporter)
		loggerProvider = otel_log.NewLoggerProvider(
			otel_log.WithResource(res),
			otel_log.WithProcessor(lbp),
		)
		shutdownFuncs = append(shutdownFuncs, loggerProvider.Shutdown)
		global.SetLoggerProvider(loggerProvider)

		// Propagator 설정
		otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(
			propagation.TraceContext{},
			propagation.Baggage{},
		))

		log.Println("OpenTelemetry initialized successfully", "endpoint", otlpEndpoint)
	})

	shutdown = func(ctx context.Context) error {
		var shutdownErr error
		for i := len(shutdownFuncs) - 1; i >= 0; i-- {
			if err := shutdownFuncs[i](ctx); err != nil {
				shutdownErr = errors.Join(shutdownErr, err)
			}
		}
		if shutdownErr != nil {
			log.Println("ERROR: OpenTelemetry shutdown finished with errors:", shutdownErr)
		} else {
			log.Println("OpenTelemetry shutdown complete.")
		}
		return shutdownErr
	}

	return shutdown, err
}

// TODO: 가능하면 어플리케이션 레벨이 아니라 ADOT Collector으로 수집
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
		log.Fatalln(err, "failed to create memory meter")
	}
}

// TODO: 가능하면 어플리케이션 레벨이 아니라 ADOT Collector으로 수집
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
		log.Fatalln(err, "failed to create CPU meter")
	}
}

func GetSemanticSpanName(packageName, functionName string) string {
	return fmt.Sprintf("%s:%s:%s", "IRIS", packageName, functionName)
}
