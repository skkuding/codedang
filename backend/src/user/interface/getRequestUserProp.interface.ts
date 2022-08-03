import { Request } from 'express'

export interface IGetRequestUserProp extends Request {
  user: {
    id: number
    email: string
  }
}
