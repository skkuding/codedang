import { PrometheusExporter } from '@opentelemetry/exporter-prometheus'
import { MeterProvider } from '@opentelemetry/sdk-metrics'

const startMetricsExporter = () => {
  // Add your port and startServer to the Prometheus options
  const options = {
    startServer: true,
    port: PrometheusExporter.DEFAULT_OPTIONS.port
  }
  const exporter = new PrometheusExporter(options, () => {
    console.log(
      'prometheus scrape endpoint: http://localhost:' +
        options.port +
        '/metrics'
    )
  })

  // Creates MeterProvider and installs the exporter as a MetricReader
  const meterProvider = new MeterProvider()
  meterProvider.addMetricReader(exporter)
  const meter = meterProvider.getMeter('example-prometheus')

  // Now, start recording data
  // const counter = meter.createCounter('metric_name', {
  //   description: 'Example of a counter'
  // })
  // counter.add(10, { pid: process.pid })

  // Creates metric instruments
  const requestCounter = meter.createCounter('requests', {
    description: 'Example of a Counter'
  })

  const upDownCounter = meter.createUpDownCounter('test_up_down_counter', {
    description: 'Example of a UpDownCounter'
  })

  const attributes = { pid: process.pid, environment: 'staging' }

  let counter = 0
  const observableCounter = meter.createObservableCounter(
    'observable_requests',
    {
      description: 'Example of an ObservableCounter'
    }
  )
  observableCounter.addCallback((observableResult) => {
    observableResult.observe(counter, attributes)
  })

  const randomMetricPromise = async () =>
    new Promise((resolve) =>
      setTimeout(() => resolve(Math.floor(Math.random() * 100)), 50)
    )

  const observableGauge = meter.createObservableGauge(
    'observable_gauge_requests',
    {
      description: 'Example of an ObservableGauge'
    }
  )
  // Callbacks are run when metrics are scraped
  observableGauge.addCallback(async (observableResult) => {
    const value: unknown = await randomMetricPromise()
    observableResult.observe(value as number, attributes)
  })

  // Record metrics
  setInterval(() => {
    counter++
    requestCounter.add(1, attributes)
    upDownCounter.add(Math.random() > 0.5 ? 1 : -1, attributes)
  }, 1000)
}

export default startMetricsExporter
