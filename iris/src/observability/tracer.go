package observability

import (
	"context"
	"fmt"
	"time"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.7.0"
)

func InitTracer(ctx context.Context) func() {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)

	// Resource
	res, err := newResource(ctx)
	reportErr(err, "failed to create resource")

	// Exporter
	traceExporter, err := newExporter(ctx)
	reportErr(err, "failed to create exporter")

	// TraceProvider
	batchSpanProcessor := sdktrace.NewBatchSpanProcessor(traceExporter)
	tracerProvider := newTraceProvider(res, batchSpanProcessor)
	otel.SetTracerProvider(tracerProvider)

	return func() {
		// Shutdown will flush any remaining spans and shut down the exporter.
		reportErr(tracerProvider.Shutdown(ctx), "failed to shutdown TracerProvider")
		cancel()
	}

}

func newTraceProvider(res *resource.Resource, bsp sdktrace.SpanProcessor) *sdktrace.TracerProvider {
	tracerProvider := sdktrace.NewTracerProvider(
		sdktrace.WithSampler(sdktrace.AlwaysSample()),
		sdktrace.WithResource(res),
		sdktrace.WithSpanProcessor(bsp),
	)
	return tracerProvider
}

func newResource(ctx context.Context) (*resource.Resource, error) {
	// Create a new resource with a service name and the service version.
	r, err := resource.New(ctx,
		resource.WithAttributes(
			// the service name used to display traces in backends
			semconv.ServiceNameKey.String("IRIS"),
		),
	)
	if err != nil {
		return nil, err
	}
	return r, nil
}

func newExporter(ctx context.Context) (*otlptrace.Exporter, error) {
	exp, err := otlptracehttp.New(ctx, otlptracehttp.WithEndpoint("localhost:44318"), otlptracehttp.WithInsecure())
	if err != nil {
		return nil, err
	}
	return exp, nil
}

func reportErr(err error, message string) {
	if err != nil {
		// print error message
		fmt.Print(message)
	}
}
