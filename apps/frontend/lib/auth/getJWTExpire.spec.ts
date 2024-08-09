import { describe, it, expect } from 'vitest'
import { getJWTExpire } from './getJWTExpire'

describe('getJWTExpire', () => {
  it('should return the expiration date of a JWT token', () => {
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3MjI5MzM5MjMsImV4cCI6MTcyMjkzNTcyMywiaXNzIjoic2trdWRpbmcuZGV2In0.WZSToxcPMwaz_0APWiqW269DOCDTrbQhT36Al_tmoow'
    const actual = getJWTExpire(token)
    const expected = 1722935723000

    expect(actual).toEqual(expected)
  })

  it('should throw an error if the token is invalid', () => {
    const token = 'foo.bar.baz'

    expect(() => getJWTExpire(token)).toThrowError(
      `Invalid token specified: invalid json for part #2 (Unexpected token 'm', "mª" is not valid JSON)`
    )
  })

  it('should throw an error if the token does not contain an expiration date', () => {
    const token =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJjb2RlZGFuZyIsImlhdCI6bnVsbCwiZXhwIjpudWxsLCJhdWQiOiIiLCJzdWIiOiJqcm9ja2V0QGV4YW1wbGUuY29tIiwiR2l2ZW5OYW1lIjoiSm9obm55IiwiU3VybmFtZSI6IlJvY2tldCIsIkVtYWlsIjoianJvY2tldEBleGFtcGxlLmNvbSIsIlJvbGUiOlsiTWFuYWdlciIsIlByb2plY3QgQWRtaW5pc3RyYXRvciJdfQ.jSZbQcBTVmU4jE0s1UXhRprIruh3SETyevFLyKnCC9w'

    expect(() => getJWTExpire(token)).toThrowError(
      'Token does not contain an expiration date'
    )
  })
})
