import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './mocks/node'

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})
