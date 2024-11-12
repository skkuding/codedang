import type { ProblemResponseDto } from './problem.response.dto'

export class RelatedProblemResponseDto {
  order: number
  problem: ProblemResponseDto
}
