import { Field } from '@nestjs/graphql'
import { ObjectType } from '@nestjs/graphql'
import { Int } from '@nestjs/graphql'
import { ID } from '@nestjs/graphql'
import { ResultStatus } from '@admin/@generated'

@ObjectType()
export class SubmissionResultOutput {
  @Field(() => ID, { nullable: false })
  id!: number

  @Field(() => Int, { nullable: false })
  submissionId!: number

  @Field(() => Int, { nullable: false })
  problemTestcaseId!: number

  @Field(() => ResultStatus, { nullable: false })
  result!: `${ResultStatus}`

  @Field(() => String, { nullable: true })
  cpuTime!: string | null

  @Field(() => Int, { nullable: true })
  memoryUsage!: number | null

  @Field(() => String, { nullable: true })
  output!: string | null

  @Field(() => Date, { nullable: false })
  createTime!: Date

  @Field(() => Date, { nullable: false })
  updateTime!: Date
}
