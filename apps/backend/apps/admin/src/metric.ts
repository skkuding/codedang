import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { HostMetrics } from '@opentelemetry/host-metrics'
import { Resource } from '@opentelemetry/resources'
import {
  MeterProvider,
  PeriodicExportingMetricReader
} from '@opentelemetry/sdk-metrics'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import * as http from 'http'

const getInstanceId = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '169.254.169.254',
      path: '/latest/meta-data/instance-id',
      method: 'GET',
      timeout: 1000
    }

    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', (chunk: Buffer) => {
        data += chunk.toString()
      })
      res.on('end', () => {
        resolve(data)
      })
    })

    req.on('error', (error: Error) => {
      console.error(error)
      reject(error)
    })

    req.end()
  })
}

const startMetricsExporter = async () => {
  try {
    const instanceId = await getInstanceId()
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
      [SemanticResourceAttributes.SERVICE_INSTANCE_ID]: instanceId,
      environment: 'production' // 사용자 정의 속성
    })

    // Creates MeterProvider and installs the exporter as a MetricReader
    const meterProvider = new MeterProvider({
      resource
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
  } catch (e) {
    console.error('Failed to initialize the metric', e)
  }
}

export default startMetricsExporter
