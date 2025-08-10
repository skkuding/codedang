import { Field, Float, Int, ObjectType, OmitType } from '@nestjs/graphql'
import { SubmissionCluster } from '@admin/@generated'
import { Match } from './check-result.dto'

@ObjectType()
class ClusterSummary {
  @Field(() => Float, { nullable: false })
  averageSimilarity: number

  @Field(() => Float, { nullable: false })
  strength: number
}

@ObjectType()
export class GetCheckResultSummaryOutput {
  @Field(() => Int, { nullable: false })
  id: number

  @Field(() => Int, { nullable: true })
  firstCheckSubmissionId: number | null

  @Field(() => Int, { nullable: true })
  secondCheckSubmissionId: number | null

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

  @Field(() => [SubmissionCluster], { nullable: false })
  submissionCluster: SubmissionCluster[]
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
