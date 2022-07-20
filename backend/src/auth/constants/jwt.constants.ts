export const ACCESS_TOKEN_EXPIRATION_SEC = 1800 // 30m
export const REFRESH_TOKEN_EXPIRATION_SEC = 86400 // 24h

//TODO: production 환경에서는 secure, signed cookie 사용하기
export const REFRESH_TOKEN_COOKIE_OPTIONS = {
  maxAge: REFRESH_TOKEN_EXPIRATION_SEC * 1000,
  httpOnly: true
  // secure: true,
}

export const AUTH_TYPE = 'Bearer'
