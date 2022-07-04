import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from 'src/prisma/prisma.service'
import { UserService } from 'src/user/user.service'
import { AuthService } from './auth.service'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { CACHE_MANAGER } from '@nestjs/common'

describe('AuthService', () => {
  let service: AuthService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: {} },
        { provide: ConfigService, useValue: {} },
        { provide: JwtService, useValue: {} },
        { provide: UserService, useValue: {} },
        { provide: CACHE_MANAGER, useValue: {} }
      ]
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
