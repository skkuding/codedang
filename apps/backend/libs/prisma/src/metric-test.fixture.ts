import { metrics } from '@opentelemetry/api'
import {
  AggregationTemporality,
  InMemoryMetricExporter,
  MeterProvider,
  PeriodicExportingMetricReader
} from '@opentelemetry/sdk-metrics'
import type { SinonSandbox } from 'sinon'

export const createMetricFixture = (sandbox: SinonSandbox) => {
  const exporter = new InMemoryMetricExporter(AggregationTemporality.CUMULATIVE)
  const provider = new MeterProvider({
    readers: [
      new PeriodicExportingMetricReader({
        exporter,
        exportIntervalMillis: 60_000
      })
    ]
  })
  sandbox.stub(metrics, 'getMeter').returns(provider.getMeter('test'))
  return { exporter, provider }
}
