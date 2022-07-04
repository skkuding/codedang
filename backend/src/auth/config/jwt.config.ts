export const ACCESS_TOKEN_EXPIRATION_SEC = 600
export const REFRESH_TOKEN_EXPIRATION_SEC = 86400

//TODO: 개발 환경에서는 httponly, secure 관련 해제, signed cookie 사용하기
export const REFRESH_TOKEN_COOKIE_OPTIONS = {
  maxAge: REFRESH_TOKEN_EXPIRATION_SEC * 1000,
  // secure: true,
  path: '/auth/reissue',
  httpOnly: true
}
