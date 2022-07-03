export type JwtPayload = {
  username: string
  userId: number
}

export type JwtObject = JwtPayload & {
  iat: number
  exp: number
}
