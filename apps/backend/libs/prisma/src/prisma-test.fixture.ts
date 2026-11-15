import type { Type } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import proxyquire from 'proxyquire'
import type { SinonSandbox } from 'sinon'
import { createPrismaPool } from './prisma-pool'

type ClientLifecycle = {
  $connect: () => Promise<void>
  $disconnect: () => Promise<void>
}

export const createPrismaFixture = async <T extends ClientLifecycle>(
  sandbox: SinonSandbox,
  modulePath: string,
  className: string,
  resources = createPrismaPool('postgresql://localhost/prisma_unit_tests', '3'),
  overrides: Record<string, unknown> = {}
) => {
  const createPool = sandbox.stub().returns(resources)
  const modules: Record<string, unknown> = { ...overrides }
  modules['./prisma-pool'] = { createPrismaPool: createPool }
  const Service: Type<T> = proxyquire(modulePath, modules)[className]
  const module = await Test.createTestingModule({
    providers: [Service, ConfigService]
  }).compile()
  const service = module.get(Service)
  const connect = sandbox.stub().resolves()
  const disconnect = sandbox.stub().resolves()
  service.$connect = connect
  service.$disconnect = disconnect
  return { module, service, resources, createPool, connect, disconnect }
}
