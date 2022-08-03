import { Request } from 'express'

export interface IGetRequestUserProp {
  user: {
    id: number
    email: string
  }
}
