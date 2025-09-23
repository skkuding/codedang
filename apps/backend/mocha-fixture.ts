import { Logger } from '@nestjs/common'
import { use } from 'chai'
import * as chaiAsPromised from 'chai-as-promised'

// Keep originals to restore after tests
const originalConsole: Partial<typeof console> = {}
type LoggerMethod = (...args: unknown[]) => void
const originalNestLogger: Partial<
  Record<'log' | 'error' | 'warn' | 'debug' | 'verbose', LoggerMethod>
> = {}

export const mochaGlobalSetup = async () => {
  use(chaiAsPromised)

  // Suppress console and NestJS logger output during tests unless explicitly enabled
  const keepLogs = process.env.MOCHA_KEEP_LOGS === '1'
  if (!keepLogs) {
    originalConsole.log = console.log
    originalConsole.warn = console.warn
    originalConsole.error = console.error
    originalConsole.info = console.info
    originalConsole.debug = console.debug

    const noop: LoggerMethod = () => {}
    console.log = noop
    console.warn = noop
    console.error = noop
    console.info = noop
    console.debug = noop

    originalNestLogger.log = Logger.prototype.log as LoggerMethod
    originalNestLogger.error = Logger.prototype.error as LoggerMethod
    originalNestLogger.warn = Logger.prototype.warn as LoggerMethod
    originalNestLogger.debug = Logger.prototype.debug as LoggerMethod
    originalNestLogger.verbose = Logger.prototype.verbose as LoggerMethod

    Logger.prototype.log = noop
    Logger.prototype.error = noop
    Logger.prototype.warn = noop
    Logger.prototype.debug = noop
    Logger.prototype.verbose = noop
  }
}

export const mochaGlobalTeardown = async () => {
  if (originalConsole.log) console.log = originalConsole.log
  if (originalConsole.warn) console.warn = originalConsole.warn
  if (originalConsole.error) console.error = originalConsole.error
  if (originalConsole.info) console.info = originalConsole.info
  if (originalConsole.debug) console.debug = originalConsole.debug

  // restore NestJS Logger methods
  if (originalNestLogger.log) Logger.prototype.log = originalNestLogger.log
  if (originalNestLogger.error)
    Logger.prototype.error = originalNestLogger.error
  if (originalNestLogger.warn) Logger.prototype.warn = originalNestLogger.warn
  if (originalNestLogger.debug)
    Logger.prototype.debug = originalNestLogger.debug
  if (originalNestLogger.verbose)
    Logger.prototype.verbose = originalNestLogger.verbose
}
