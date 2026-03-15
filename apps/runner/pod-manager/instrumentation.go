package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"
	"strings"
	"sync"
	"time"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploggrpc"
	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
	"go.opentelemetry.io/otel/log/global"
	"go.opentelemetry.io/otel/propagation"
	otellog "go.opentelemetry.io/otel/sdk/log"
	otelmetric "go.opentelemetry.io/otel/sdk/metric"
	otelresource "go.opentelemetry.io/otel/sdk/resource"
	oteltrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.26.0"
)

const podManagerServiceName = "RUNNER_POD_MANAGER"

var (
	instrumentationOnce sync.Once
	shutdownFuncs       []func(context.Context) error
)

func initInstrumentation(
	ctx context.Context,
	serviceName, serviceVersion, otlpEndpoint string,
) (func(context.Context) error, error) {
	var initErr error

	instrumentationOnce.Do(func() {
		resource, err := otelresource.New(
			ctx,
			otelresource.WithAttributes(
				semconv.ServiceName(serviceName),
				semconv.ServiceVersion(serviceVersion),
				semconv.DeploymentEnvironment(strings.ToLower(strings.TrimSpace(os.Getenv("APP_ENV")))),
			),
			otelresource.WithProcess(),
			otelresource.WithHost(),
			otelresource.WithContainer(),
			otelresource.WithOS(),
			otelresource.WithTelemetrySDK(),
		)
		if err != nil {
			initErr = fmt.Errorf("create resource: %w", err)
			return
		}

		traceExporter, err := otlptracegrpc.New(
			ctx,
			otlptracegrpc.WithEndpoint(otlpEndpoint),
			otlptracegrpc.WithInsecure(),
		)
		if err != nil {
			initErr = fmt.Errorf("create trace exporter: %w", err)
			return
		}
		traceProvider := oteltrace.NewTracerProvider(
			oteltrace.WithResource(resource),
			oteltrace.WithSpanProcessor(oteltrace.NewBatchSpanProcessor(traceExporter)),
		)
		otel.SetTracerProvider(traceProvider)
		shutdownFuncs = append(shutdownFuncs, traceProvider.Shutdown)

		metricExporter, err := otlpmetricgrpc.New(
			ctx,
			otlpmetricgrpc.WithEndpoint(otlpEndpoint),
			otlpmetricgrpc.WithInsecure(),
		)
		if err != nil {
			initErr = fmt.Errorf("create metric exporter: %w", err)
			return
		}
		metricProvider := otelmetric.NewMeterProvider(
			otelmetric.WithResource(resource),
			otelmetric.WithReader(
				otelmetric.NewPeriodicReader(metricExporter, otelmetric.WithInterval(3*time.Second)),
			),
		)
		otel.SetMeterProvider(metricProvider)
		shutdownFuncs = append(shutdownFuncs, metricProvider.Shutdown)

		logExporter, err := otlploggrpc.New(
			ctx,
			otlploggrpc.WithEndpoint(otlpEndpoint),
			otlploggrpc.WithInsecure(),
		)
		if err != nil {
			initErr = fmt.Errorf("create log exporter: %w", err)
			return
		}
		loggerProvider := otellog.NewLoggerProvider(
			otellog.WithResource(resource),
			otellog.WithProcessor(otellog.NewBatchProcessor(logExporter)),
		)
		global.SetLoggerProvider(loggerProvider)
		shutdownFuncs = append(shutdownFuncs, loggerProvider.Shutdown)

		otel.SetTextMapPropagator(
			propagation.NewCompositeTextMapPropagator(
				propagation.TraceContext{},
				propagation.Baggage{},
			),
		)

		log.Printf("OpenTelemetry initialized service=%s endpoint=%s", serviceName, otlpEndpoint)
	})

	shutdown := func(ctx context.Context) error {
		var shutdownErr error
		for idx := len(shutdownFuncs) - 1; idx >= 0; idx-- {
			if err := shutdownFuncs[idx](ctx); err != nil {
				shutdownErr = errors.Join(shutdownErr, err)
			}
		}
		return shutdownErr
	}

	return shutdown, initErr
}
