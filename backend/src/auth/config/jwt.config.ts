// TODO: .env로 옮기기, env, production 환경 구분
export const SECRET_KEY = 'dev'
export const ACCESS_TOKEN_EXPIRATION_SEC = 600
export const REFRESH_TOKEN_EXPIRATION_SEC = 20 //1209600 on production

//TODO: 개발 환경에서는 httponly, secure 관련 해제, signed cookie 사용하기
export const REFRESH_TOKEN_COOKIE_OPTIONS = {
  maxAge: REFRESH_TOKEN_EXPIRATION_SEC * 1000,
  // secure: true,
  path: '/auth/reissue',
  httpOnly: true
}
