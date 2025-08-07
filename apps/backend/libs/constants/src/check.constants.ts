import { CheckResultStatus } from '@prisma/client'

export const CheckStatus = (code: number) => {
  switch (code) {
    case 0:
      return CheckResultStatus.Completed
    case 1:
      return CheckResultStatus.JplagError
    default:
      return CheckResultStatus.ServerError
  }
}
