import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { Resource } from '@opentelemetry/resources'
import { NodeSDK } from '@opentelemetry/sdk-node'
import {
  BasicTracerProvider,
  SimpleSpanProcessor
} from '@opentelemetry/sdk-trace-node'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { PrismaInstrumentation } from '@prisma/instrumentation'

class Tracer {
  private sdk: NodeSDK | null = null

  // url is optional and can be omitted - default is http://localhost:4318/v1/traces
  private exporter = new OTLPTraceExporter({
    url: 'http://localhost:44318/v1/traces'
  })

  private provider = new BasicTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'ADMIN-API'
    })
  })

  public init() {
    try {
      // export spans to opentelemetry collector
      this.provider.addSpanProcessor(new SimpleSpanProcessor(this.exporter))
      this.provider.register()

      this.sdk = new NodeSDK({
        traceExporter: this.exporter,
        instrumentations: [
          new HttpInstrumentation(),
          new ExpressInstrumentation(),
          new PrismaInstrumentation()
        ]
      })

      this.sdk.start()

      console.info('The tracer has been initialized')
    } catch (e) {
      console.error('Failed to initialize the tracer', e)
    }
  }
}

export default new Tracer()
