import { expect } from 'chai'
import { isIrisProgressPayload } from '../src/types'

describe('isIrisProgressPayload', () => {
  it('should accept a valid payload', () => {
    expect(isIrisProgressPayload({ total: 3, current: 1, statusCode: 0 })).to.be
      .true
  })

  const invalidCases: [string, unknown][] = [
    ['null', null],
    ['a missing field', { total: 3, current: 1 }],
    ['a zero total', { total: 0, current: 0, statusCode: 0 }],
    ['current above total', { total: 3, current: 4, statusCode: 0 }],
    ['a negative current', { total: 3, current: -1, statusCode: 0 }],
    ['a non-integer total', { total: 1.5, current: 1, statusCode: 0 }],
    ['an unknown status code', { total: 3, current: 1, statusCode: 99 }]
  ]

  for (const [name, value] of invalidCases) {
    it(`should reject ${name}`, () => {
      expect(isIrisProgressPayload(value)).to.be.false
    })
  }
})
