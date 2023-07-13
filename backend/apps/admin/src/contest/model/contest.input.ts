import { Field, ID, InputType } from '@nestjs/graphql'
import { RequestStatus } from '../enum/request-status.enum'

@InputType()
export class ContestInput {
  @Field(() => ID, { nullable: false })
  id!: number

  @Field(() => String, { nullable: false })
  groupName!: string

  @Field(() => String, { nullable: false })
  type!: string

  @Field(() => String, { nullable: false })
  title!: string

  @Field(() => String, { nullable: false })
  summary!: string

  @Field(() => String, { nullable: false })
  description!: string

  @Field(() => String, { nullable: false })
  startTime!: string

  @Field(() => String, { nullable: false })
  endTime!: string

  @Field(() => Boolean, { nullable: false })
  visible!: boolean

  @Field(() => Boolean, { nullable: false })
  rankVisible!: boolean

  @Field(() => Boolean, { nullable: false })
  difficultyVisible!: boolean

  @Field(() => String, { nullable: false })
  status!: RequestStatus
}
