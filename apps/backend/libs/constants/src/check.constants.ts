import { CheckResultStatus } from '@prisma/client'

export const CheckStatus = (code: number) => {
  switch (code) {
    case 0:
      return CheckResultStatus.Completed
    case 1:
      return CheckResultStatus.JplagError
    case 2:
      return CheckResultStatus.TokenError
    default:
      return CheckResultStatus.ServerError
  }
}
