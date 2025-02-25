import { ObjectType, Field, Int } from '@nestjs/graphql'

@ObjectType()
export class ProblemRecord {
  @Field(() => Int)
  order: number

  @Field(() => Int)
  problemId: number

  @Field(() => Int)
  score: number

  @Field(() => Int)
  penalty: number

  @Field(() => Int)
  submissionCount: number

  @Field(() => Boolean)
  isFirstSolver: boolean
}

@ObjectType()
export class LeaderboardEntry {
  @Field(() => Int)
  userId: number

  @Field()
  username: string

  @Field(() => Int)
  finalScore: number

  @Field(() => Int)
  finalTotalPenalty: number

  @Field(() => Int)
  rank: number

  @Field(() => [ProblemRecord])
  problemRecords: ProblemRecord[]
}

@ObjectType()
export class ContestLeaderboard {
  @Field(() => Int)
  maxScore: number

  @Field(() => Int)
  participatedNum: number

  @Field(() => Int)
  registeredNum: number

  @Field(() => [LeaderboardEntry])
  leaderboard: LeaderboardEntry[]

  @Field(() => Boolean)
  isFrozen: boolean
}
