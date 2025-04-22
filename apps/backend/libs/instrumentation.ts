import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino'
import type { Resource } from '@opentelemetry/resources'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node'
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION
} from '@opentelemetry/semantic-conventions'
import { PrismaInstrumentation } from '@prisma/instrumentation'
import { request } from 'http'

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG)

/**
 * Instrumentation는 OpenTelemetry SDK를 초기화하고 설정하는 클래스입니다.
 * AWS EC2 인스턴스 메타데이터를 사용하여 인스턴스 ID를 가져오고,
 * OpenTelemetry SDK를 사용하여 트레이스, 메트릭 및 로그를 수집합니다.
 * 또한, HTTP, Express 및 Prisma에 대한 자동 계측을 설정합니다.
 * @class InstrumentationSDK
 */
class Instrumentation {
  private static sdk: NodeSDK | null = null

  /**
   * AWS 환경에서의 Instance ID를 가져오는 함수입니다.
   * [AWS EC2 Instance Metadata Service](https://docs.aws.amazon.com/ko_kr/AWSEC2/latest/UserGuide/instancedata-data-retrieval.html)를 사용하여 Instance ID를 가져옵니다.
   * TODO: ADOT Collector를 사용하여 Instance ID를 가져오는 방법으로 변경해야 합니다.
   * @returns {Promise<string>}
   */
  private static getAWSInstanceId = (): Promise<string> => {
    const AWS_METADATA_HOSTNAME = '169.254.169.254'
    const AWS_METADATA_INSTANCE_ID_PATH = '/latest/meta-data/instance-id'

    return new Promise((resolve, reject) => {
      const options = {
        hostname: AWS_METADATA_HOSTNAME,
        path: AWS_METADATA_INSTANCE_ID_PATH,
        method: 'GET',
        timeout: 1000
      }

      const req = request(options, (res) => {
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

  private static getResource = async (): Promise<Resource> => {
    let instanceId: string
    if (process.env.APP_ENV == 'production' || process.env.APP_ENV == 'rc') {
      instanceId = await Instrumentation.getAWSInstanceId()
    }
    instanceId = 'local'
    const ATTR_INSTANCE_ID = 'service.instance.id'

    return resourceFromAttributes({
      [ATTR_SERVICE_NAME]: 'CLIENT-API', // TODO: 동적으로 서비스 이름을 가져오기
      [ATTR_SERVICE_VERSION]: '2.2.0', // TODO: 동적으로 서비스 버전을 가져오기
      [ATTR_INSTANCE_ID]: instanceId,
      environment: 'production'
    })
  }

  static async start(otlpEndpointUrl: string): Promise<void> {
    if (Instrumentation.sdk) {
      return // 이미 초기화된 경우 다시 초기화하지 않음
    }

    const resource = await Instrumentation.getResource()

    Instrumentation.sdk = new NodeSDK({
      resource,
      // trace
      spanProcessors: [
        new BatchSpanProcessor(
          new OTLPTraceExporter({
            url: otlpEndpointUrl
          })
        )
      ],
      // metric
      metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
          url: otlpEndpointUrl
        }),
        exportIntervalMillis: 1000
      }),
      // log
      logRecordProcessors: [
        new BatchLogRecordProcessor(
          new OTLPLogExporter({
            url: otlpEndpointUrl
          })
        )
      ],
      instrumentations: [
        new HttpInstrumentation(),
        new ExpressInstrumentation(),
        new PrismaInstrumentation(),
        new PinoInstrumentation()
      ]
    })

    return Instrumentation.sdk.start()
  }

  static async shutdown(): Promise<void> {
    if (Instrumentation.sdk) {
      await Instrumentation.sdk.shutdown()
    }
  }
}

process.on('SIGTERM', () => {
  Instrumentation.shutdown()
    .then(() => console.log('OTEL SDK shut down successfully'))
    .catch((err) => console.error('Error shutting down OTEL SDK', err))
    .finally(() => process.exit(0))
})

export default Instrumentation
