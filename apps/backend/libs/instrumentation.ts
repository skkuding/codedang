import {
  Injectable,
  Logger,
  Module,
  type OnApplicationShutdown
} from '@nestjs/common'
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
import { containerDetector } from '@opentelemetry/resource-detector-container'
import {
  envDetector,
  hostDetector,
  osDetector,
  processDetector,
  resourceFromAttributes
} from '@opentelemetry/resources'
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs'
import {
  AggregationType,
  PeriodicExportingMetricReader,
  type ViewOptions
} from '@opentelemetry/sdk-metrics'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node'
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION
} from '@opentelemetry/semantic-conventions'
import { PrismaInstrumentation } from '@prisma/instrumentation'

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
   * @param serviceName 서비스 이름. OTEL_SERVICE_NAME 환경변수가 있으면 그 값이 우선한다
   */
  static async start(serviceName: string): Promise<void> {
    if (Instrumentation.sdk) {
      return // 이미 초기화된 경우 다시 초기화하지 않음
    }

    const spanProcessors = [new BatchSpanProcessor(new OTLPTraceExporter())]
    const metricReader = new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter(),
      exportIntervalMillis: 15000
    })
    const logRecordProcessors = [
      new BatchLogRecordProcessor(new OTLPLogExporter())
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

    const views: ViewOptions[] = [
      // nestjs-otel apiMetrics도 HttpInstrumentation과 같은 이름으로 기록하므로 한쪽만 남긴다
      {
        meterName: 'nestjs-otel',
        instrumentName: 'http.server.duration',
        aggregation: { type: AggregationType.DROP }
      },
      // 엔드포인트 최적화 전후 비교가 보이도록 100~500ms 구간을 촘촘히 센다
      {
        meterName: '@opentelemetry/instrumentation-http',
        instrumentName: 'http.server.duration',
        aggregation: {
          type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM,
          options: {
            boundaries: [
              0, 5, 10, 25, 50, 75, 100, 150, 200, 250, 300, 400, 500, 750,
              1000, 2500, 5000, 7500, 10000
            ]
          }
        }
      }
    ]

    // OTEL_RESOURCE_ATTRIBUTES는 배포 설정이 채우므로, 이미지에 빌드 시점에 넣은 버전은 따로 읽는다
    const version = process.env.APP_VERSION

    Instrumentation.sdk = new NodeSDK({
      resource: resourceFromAttributes({
        [ATTR_SERVICE_NAME]: serviceName,
        ...(version && { [ATTR_SERVICE_VERSION]: version })
      }),
      resourceDetectors: [
        processDetector,
        hostDetector,
        containerDetector,
        osDetector,
        envDetector
      ],
      spanProcessors,
      metricReader,
      views,
      logRecordProcessors,
      textMapPropagator,
      instrumentations
    })

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

/**
 * OTEL SDK 정리를 NestJS의 종료 훅에 연결합니다.
 * 종료 경로는 `app.enableShutdownHooks()` 하나이며, HTTP 서버가 닫힌 뒤
 * `onApplicationShutdown`에서 남은 텔레메트리를 flush합니다.
 * @class InstrumentationShutdownService
 */
@Injectable()
export class InstrumentationShutdownService implements OnApplicationShutdown {
  async onApplicationShutdown(): Promise<void> {
    await Instrumentation.shutdown()
  }
}

@Module({
  providers: [InstrumentationShutdownService]
})
export class InstrumentationModule {}

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
