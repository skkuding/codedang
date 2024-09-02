import { Scalar, type CustomScalar } from '@nestjs/graphql'
import { type ValueNode, Kind } from 'graphql'
import { UnprocessableDataException } from '@libs/exception'

@Scalar('IntScore', () => IntScoreScalar)
export class IntScoreScalar implements CustomScalar<number, number> {
  parseValue(value: number) {
    if (typeof value !== 'number' || value < 0 || !Number.isInteger(value)) {
      throw new UnprocessableDataException(
        'Score(ScoreWeight) must be a non-negative integer.'
      )
    }
    return value
  }

  serialize(value: number) {
    return value
  }

  parseLiteral(ast: ValueNode) {
    if (ast.kind === Kind.INT) {
      const value = parseInt(ast.value, 10)
      if (value >= 0) return value
    }
    throw new UnprocessableDataException(
      'Score(ScoreWeight) must be a non-negative integer.'
    )
  }
}
