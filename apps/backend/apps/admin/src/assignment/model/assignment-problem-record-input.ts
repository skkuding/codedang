import { Field, Float, InputType, Int } from '@nestjs/graphql'
import { IsNumber, IsOptional, IsString, Min } from 'class-validator'

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
  @IsNumber()
  @Min(0)
  @Field(() => Float, { nullable: true })
  finalScore?: number
}
