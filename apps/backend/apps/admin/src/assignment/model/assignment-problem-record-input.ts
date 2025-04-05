import { Field, InputType, Int } from '@nestjs/graphql'
import { IsOptional, IsPositive, IsString, Min } from 'class-validator'

@InputType()
export class UpdateAssignmentProblemRecordInput {
  @Field(() => Int, { nullable: false })
  assignmentId!: number

  @Field(() => Int, { nullable: false })
  problemId!: number

  @Field(() => Int, { nullable: false })
  userId!: number

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  comment?: string

  @IsOptional()
  @Min(0)
  @Field(() => Int, { nullable: true })
  finalScore?: number
}
