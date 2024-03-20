import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { HostMetrics } from '@opentelemetry/host-metrics'
import { Resource } from '@opentelemetry/resources'
import {
  MeterProvider,
  PeriodicExportingMetricReader
} from '@opentelemetry/sdk-metrics'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'

const startMetricsExporter = () => {
  const options = {
    url:
      'http://' + process.env.OTEL_EXPORTER_OTLP_ENDPOINT_URL + '/v1/metrics', // Grafana Agent Metric을 받는 url
    headers: {},
    concurrencyLimit: 5
  }
  const exporter = new OTLPMetricExporter(options)

  const resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'backend-admin-metric',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
    environment: 'production' // 사용자 정의 속성
  })

  // Creates MeterProvider and installs the exporter as a MetricReader
  const meterProvider = new MeterProvider({
    resource: resource
  })
  meterProvider.addMetricReader(
    new PeriodicExportingMetricReader({
      exporter,
      exportIntervalMillis: 1000
    })
  )

  const hostMetrics = new HostMetrics({
    meterProvider,
    name: 'backend-admin-host-metric'
  })
  hostMetrics.start()
}

export default startMetricsExporter
