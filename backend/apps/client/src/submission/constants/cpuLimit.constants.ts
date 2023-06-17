import { Language } from '@prisma/client'

const cpuLimitTable = {
  [Language.C]: (t: number) => t,
  [Language.Cpp]: (t: number) => t,
  [Language.Golang]: (t: number) => t + 2000,
  [Language.Java]: (t: number) => t * 2 + 1000,
  [Language.Python2]: (t: number) => t * 3 + 2000,
  [Language.Python3]: (t: number) => t * 3 + 200
}

export const calculateTimeLimit = (language: Language, time: number) =>
  cpuLimitTable[language](time)
