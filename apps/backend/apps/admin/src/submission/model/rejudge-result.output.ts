import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class RejudgeResult {
  @Field(() => Int)
  totalSubmissions: number

  @Field(() => Int)
  processedSubmissions: number

  @Field(() => String)
  message: string
}
