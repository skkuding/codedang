export interface EmailAuthJwtPayload {
  email: string
}

export interface EmailAuthJwtObject extends EmailAuthJwtPayload {
  iat: number
  exp: number
  iss: string
}
