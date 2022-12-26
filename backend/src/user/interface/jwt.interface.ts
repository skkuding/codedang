export interface PasswordResetJwtPayload {
  userId: number
}

export interface PasswordResetJwtObject extends PasswordResetJwtPayload {
  iat: number
  exp: number
  iss: string
}
