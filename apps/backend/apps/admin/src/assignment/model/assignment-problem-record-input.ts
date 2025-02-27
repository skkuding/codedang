import { Field, InputType, Int } from '@nestjs/graphql'
import { IsOptional, IsPositive, IsString } from 'class-validator'

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
  @IsPositive()
  @Field(() => Int, { nullable: true })
  finalScore?: number
}
