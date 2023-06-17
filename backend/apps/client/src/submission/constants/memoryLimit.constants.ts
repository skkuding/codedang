import { Language } from '@prisma/client'

const memoryLimitTable = {
  [Language.C]: (m: number) => 1024 * 1024 * m,
  [Language.Cpp]: (m: number) => 1024 * 1024 * m,
  [Language.Golang]: (m: number) => 1024 * 1024 * (m * 2 + 512),
  [Language.Java]: (m: number) => 1024 * 1024 * (m * 2 + 16),
  [Language.Python2]: (m: number) => 1024 * 1024 * (m * 2 + 32),
  [Language.Python3]: (m: number) => 1024 * 1024 * (m * 2 + 32)
}

export const calculateMemoryLimit = (language: Language, memory: number) =>
  memoryLimitTable[language](memory)
