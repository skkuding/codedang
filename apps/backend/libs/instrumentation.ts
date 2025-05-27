import { Logger } from '@nestjs/common'
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator
} from '@opentelemetry/core'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'
import { AmqplibInstrumentation } from '@opentelemetry/instrumentation-amqplib'
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
import axios from 'axios'

/**
 * Instrumentation는 OpenTelemetry SDK를 초기화하고 설정하는 클래스입니다.
 * AWS EC2 인스턴스 메타데이터를 사용하여 인스턴스 ID를 가져오고,
 * OpenTelemetry SDK를 사용하여 트레이스, 메트릭 및 로그를 수집합니다.
 * 또한, HTTP, Express 및 Prisma에 대한 자동 계측을 설정합니다.
 * @class InstrumentationSDK
 */
class Instrumentation {
  private static sdk: NodeSDK | null = null
  static readonly logger: Logger = new Logger('Instrumentation')

  /**
   * AWS 환경에서의 Instance ID를 가져오는 함수입니다.
   * [AWS EC2 Instance Metadata Service](https://docs.aws.amazon.com/ko_kr/AWSEC2/latest/UserGuide/instancedata-data-retrieval.html)를 사용하여 Instance ID를 가져옵니다.
   * TODO: ADOT Collector를 사용하여 Instance ID를 가져오는 방법으로 변경해야 합니다.
   * @returns {Promise<string>}
   */
  private static getAWSInstanceId = (): Promise<string> => {
    /**
     * AWS EC2 인스턴스 메타데이터 서비스의 호스트 주소
     * EC2 인스턴스 내에서만 접근 가능한 특수 IP 주소
     * @see https://docs.aws.amazon.com/ko_kr/AWSEC2/latest/UserGuide/instancedata-data-retrieval.html#instancedata-inside-access
     */
    const AWS_METADATA_HOSTNAME = '169.254.169.254'
    /**
     * EC2 인스턴스 ID를 가져오기 위한 메타데이터 경로
     * 이 경로로 요청하면 현재 실행 중인 EC2 인스턴스의 고유 ID를 반환받음
     */
    const AWS_METADATA_INSTANCE_ID_PATH = '/latest/meta-data/instance-id'
    const url = `http://${AWS_METADATA_HOSTNAME}${AWS_METADATA_INSTANCE_ID_PATH}`

    return axios.get(url, {
      timeout: 1000
    })
  }

  public static getResource = async (
    serviceName: string,
    serviceVersion: string
  ): Promise<Resource> => {
    let instanceId: string
    const environment = process.env.APP_ENV || 'local'
    if (environment == 'production' || environment == 'rc') {
      instanceId = await Instrumentation.getAWSInstanceId()
    }
    instanceId = '1'

    const ATTR_INSTANCE_ID = 'service.instance.id'
    const ATTR_ENVIRONMENT = 'service.environment'
    return resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName, // TODO: 동적으로 서비스 이름을 가져오기
      [ATTR_SERVICE_VERSION]: serviceVersion, // TODO: 동적으로 서비스 버전을 가져오기
      [ATTR_INSTANCE_ID]: instanceId,
      [ATTR_ENVIRONMENT]: environment
    })
  }

  /**
   * @param otlpEndpointUrl Collector의 OTLP Endpoint URL, 예: `localhost:4317`
   */
  static async start(
    otlpEndpointUrl: string,
    resource: Resource
  ): Promise<void> {
    if (Instrumentation.sdk) {
      return // 이미 초기화된 경우 다시 초기화하지 않음
    }

    const otlpEndpointUrlWithScheme = otlpEndpointUrl.startsWith('http')
      ? otlpEndpointUrl
      : `http://${otlpEndpointUrl}`

    const spanProcessors = [
      new BatchSpanProcessor(
        new OTLPTraceExporter({
          url: otlpEndpointUrlWithScheme
        })
      )
    ]
    const metricReader = new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: otlpEndpointUrlWithScheme
      }),
      exportIntervalMillis: 15000
    })
    const logRecordProcessors = [
      new BatchLogRecordProcessor(
        new OTLPLogExporter({
          url: otlpEndpointUrlWithScheme
        })
      )
    ]

    const textMapPropagator = new CompositePropagator({
      propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()]
    })

    const instrumentations = [
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
      new PrismaInstrumentation(),
      new PinoInstrumentation(),
      new AmqplibInstrumentation()
    ]

    Instrumentation.sdk = new NodeSDK({
      resource,
      spanProcessors,
      metricReader,
      logRecordProcessors,
      textMapPropagator,
      instrumentations
    })

    this.logger.log(
      `OTEL SDK starting with endpoint: ${otlpEndpointUrlWithScheme}`
    )
    return Instrumentation.sdk.start()
  }

  static async shutdown(): Promise<void> {
    if (Instrumentation.sdk) {
      await Instrumentation.sdk.shutdown()
      Instrumentation.sdk = null
      this.logger.log('OTEL SDK shutdown successfully')
    } else {
      this.logger.warn('OTEL SDK is not initialized')
    }
  }
}

process.on('SIGTERM', () => Instrumentation.shutdown())

export default Instrumentation

export const openTelemetryModuleOption = {
  metrics: {
    hostMetrics: true,
    apiMetrics: {
      enable: true,
      ignoreRoutes: ['/favicon.ico'],
      ignoreUndefinedRoutes: false
    }
  }
}
