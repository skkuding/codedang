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
import { JwtStrategy } from '../../auth/src/jwt/jwt.strategy'

@Controller('protected')
class ProtectedController {
  @Get()
  getProtected() {
    return 'protected'
  }
}

const secret = 'internal-metrics-test-secret'

for (const mode of ['client-development', 'client-production', 'admin']) {
  describe(`Internal metrics retirement (${mode})`, () => {
    let app: INestApplication
    let url: string
    const metricsPath =
      mode === 'client-development'
        ? '/internal/prisma'
        : '/api/internal/prisma'
    const getUserRole = stub()
    const protectedPath =
      mode === 'client-production' ? '/api/protected' : '/protected'

    beforeEach(async () => {
      getUserRole.reset()
      const module = await Test.createTestingModule({
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
      }).compile()
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

    it('does not expose the retired Prisma metrics endpoint', async () => {
      const token = new JwtService({ secret }).sign({
        userId: 1,
        username: 'test',
        userRole: Role.Admin,
        tokenType: 'access'
      })
      const response = await fetch(`${url}${metricsPath}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      expect(response.status).to.equal(404)
      // The retired route is no longer an authentication bypass.
    })

    it('keeps protected routes authenticated', async () => {
      const response = await fetch(`${url}${protectedPath}`)
      expect(response.status).to.equal(401)
    })

    it('accepts valid credentials on protected routes', async () => {
      const token = new JwtService({ secret }).sign({
        userId: 1,
        username: 'test',
        userRole: Role.Admin,
        tokenType: 'access'
      })
      const response = await fetch(`${url}${protectedPath}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      expect(response.status).to.equal(200)
    })

    it('rejects refresh tokens on protected routes', async () => {
      const token = new JwtService({ secret }).sign({
        userId: 1,
        username: 'test',
        userRole: Role.Admin,
        tokenType: 'refresh'
      })
      const response = await fetch(`${url}${protectedPath}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      expect(response.status).to.equal(401)
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
        const token = new JwtService({ secret }).sign({
          userId: 1,
          username: 'test',
          userRole: Role.Admin,
          tokenType: 'access'
        })
        const response = await fetch(`${url}/api/api/internal/prisma`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        expect(response.status).to.equal(404)
      })
    }

    if (mode === 'admin') {
      it('still rejects a normal user on admin routes', async () => {
        const token = new JwtService({ secret }).sign({
          userId: 1,
          username: 'test',
          userRole: Role.User,
          tokenType: 'access'
        })
        const response = await fetch(`${url}${protectedPath}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        expect(response.status).to.equal(403)
      })
    }
  })
}
