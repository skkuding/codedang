import { mkdir, rm, stat } from 'node:fs/promises'

async function acquireExecutionLock(path, staleAfterMs = 13 * 60 * 60 * 1000) {
  try {
    await mkdir(path)
  } catch (error) {
    if (error.code !== 'EEXIST') throw error

    const lock = await stat(path)
    if (Date.now() - lock.mtimeMs <= staleAfterMs) return null

    await rm(path, { recursive: true, force: true })
    try {
      await mkdir(path)
    } catch (retryError) {
      if (retryError.code === 'EEXIST') return null
      throw retryError
    }
  }

  return () => rm(path, { recursive: true, force: true })
}

export { acquireExecutionLock }
