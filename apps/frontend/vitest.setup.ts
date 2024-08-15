import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './mock/node'

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})
