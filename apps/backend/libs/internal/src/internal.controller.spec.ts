import { Controller, Get, type INestApplication } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { Test } from '@nestjs/testing'
import { Role } from '@prisma/client'
import { expect } from 'chai'
import { stub } from 'sinon'
import { AdminGuard, JwtAuthGuard, RolesService } from '@libs/auth'
import { PrismaService } from '@libs/prisma'
import { JwtStrategy } from '../../auth/src/jwt/jwt.strategy'
import { AdminInternalModule, InternalModule } from './internal.module'

@Controller('protected')
class ProtectedController {
  @Get()
  getProtected() {
    return 'protected'
  }
}

const metrics =
  '# HELP prisma_pool_connections_busy Active connections\n' +
  '# TYPE prisma_pool_connections_busy gauge\nprisma_pool_connections_busy 0\n'
const secret = 'internal-metrics-test-secret'

for (const mode of ['client-development', 'client-production', 'admin']) {
  describe(`Internal metrics (${mode})`, () => {
    let app: INestApplication
    let url: string
    const metricsPath =
      mode === 'client-development'
        ? '/internal/prisma'
        : '/api/internal/prisma'
    const prometheus = stub()
    const getUserRole = stub()
    const protectedPath =
      mode === 'client-production' ? '/api/protected' : '/protected'

    beforeEach(async () => {
      prometheus.reset()
      prometheus.resolves(metrics)
      getUserRole.reset()
      const module = await Test.createTestingModule({
        imports: [mode === 'admin' ? AdminInternalModule : InternalModule],
        controllers: [ProtectedController],
        providers: [
          {
            provide: ConfigService,
            useValue: new ConfigService({ ['JWT_SECRET']: secret })
          },
          { provide: RolesService, useValue: { getUserRole } },
          JwtStrategy,
          { provide: APP_GUARD, useClass: JwtAuthGuard },
          ...(mode === 'admin'
            ? [{ provide: APP_GUARD, useClass: AdminGuard }]
            : [])
        ]
      })
        .overrideProvider(PrismaService)
        .useValue({ $metrics: { prometheus } })
        .compile()
      app = module.createNestApplication({ logger: false })
      if (mode === 'client-production') {
        app.setGlobalPrefix('api')
      }
      await app.listen(0, '127.0.0.1')
      url = await app.getUrl()
    })

    afterEach(async () => {
      await app?.close()
    })

    it('returns Prometheus metrics without authentication or role lookup', async () => {
      const response = await fetch(`${url}${metricsPath}`)
      expect(response.status).to.equal(200)
      expect(
        response.headers
          .get('content-type')
          ?.split(';')
          .map((part) => part.trim())
      ).to.have.members(['text/plain', 'version=0.0.4', 'charset=utf-8'])
      expect(await response.text()).to.equal(metrics)
      expect(prometheus.calledOnce).to.equal(true)
      expect(getUserRole.called).to.equal(false)
    })

    it('keeps protected routes authenticated', async () => {
      const response = await fetch(`${url}${protectedPath}`)
      expect(response.status).to.equal(401)
    })

    it('accepts valid credentials on protected routes', async () => {
      const token = new JwtService({ secret }).sign({
        userId: 1,
        username: 'test',
        userRole: Role.Admin
      })
      const response = await fetch(`${url}${protectedPath}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      expect(response.status).to.equal(200)
    })

    it('excludes internal metrics from Swagger', () => {
      const document = SwaggerModule.createDocument(
        app,
        new DocumentBuilder().build()
      )
      expect(document.paths).not.to.have.property('/internal/prisma')
      expect(document.paths).not.to.have.property('/api/internal/prisma')
    })

    if (mode === 'client-production') {
      it('does not apply the API prefix twice', async () => {
        const response = await fetch(`${url}/api/api/internal/prisma`)
        expect(response.status).to.equal(404)
        expect(prometheus.called).to.equal(false)
      })
    }

    if (mode === 'admin') {
      it('still rejects a normal user on admin routes', async () => {
        const token = new JwtService({ secret }).sign({
          userId: 1,
          username: 'test',
          userRole: Role.User
        })
        const response = await fetch(`${url}${protectedPath}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        expect(response.status).to.equal(403)
      })
    }
  })
}
