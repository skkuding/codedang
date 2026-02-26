import { Field, Float, Int, ObjectType, OmitType } from '@nestjs/graphql'
import { Match } from './check-result.dto'

@ObjectType()
class ClusterSummary {
  @Field(() => Float, { nullable: false })
  averageSimilarity: number

  @Field(() => Float, { nullable: false })
  strength: number
}

@ObjectType()
class UserInfo {
  @Field(() => String, { nullable: false })
  username: string

  @Field(() => String, { nullable: false })
  studentId: string
}
@ObjectType()
class ComparedSubmissionInfo {
  @Field(() => Int, { nullable: false })
  id: number

  @Field(() => UserInfo, { nullable: true })
  user: UserInfo | null
}

@ObjectType()
class SubmissionClusterInfo {
  @Field(() => Int, { nullable: false })
  submissionId: number

  @Field(() => Int, { nullable: false })
  clusterId: number

  @Field(() => UserInfo, { nullable: true })
  user: UserInfo | null
}

@ObjectType()
export class GetCheckResultSummaryOutput {
  @Field(() => Int, { nullable: false })
  id: number

  @Field(() => ComparedSubmissionInfo, { nullable: true })
  firstCheckSubmission: ComparedSubmissionInfo | null

  @Field(() => ComparedSubmissionInfo, { nullable: true })
  secondCheckSubmission: ComparedSubmissionInfo | null

  @Field(() => Float, { nullable: false })
  averageSimilarity: number

  @Field(() => Float, { nullable: false })
  maxSimilarity: number

  @Field(() => Int, { nullable: false })
  maxLength: number

  @Field(() => Int, { nullable: false })
  longestMatch: number

  @Field(() => Float, { nullable: false })
  firstSimilarity: number

  @Field(() => Float, { nullable: false })
  secondSimilarity: number

  @Field(() => Int, { nullable: true })
  clusterId: number | null

  @Field(() => ClusterSummary, { nullable: true })
  cluster: ClusterSummary | null
}

@ObjectType()
export class GetClusterOutput {
  @Field(() => Int, { nullable: false })
  id: number

  @Field(() => Float, { nullable: false })
  averageSimilarity: number

  @Field(() => Float, { nullable: false })
  strength: number

  @Field(() => [SubmissionClusterInfo], { nullable: false })
  submissionClusterInfos: SubmissionClusterInfo[]
}

@ObjectType()
export class GetCheckResultDetailOutput extends OmitType(
  GetCheckResultSummaryOutput,
  ['id', 'cluster']
) {
  @Field(() => Int, { nullable: false })
  requestId: number

  @Field(() => [Match], { nullable: false })
  matches: Match[]
}
