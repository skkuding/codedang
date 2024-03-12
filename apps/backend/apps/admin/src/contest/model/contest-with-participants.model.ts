import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Contest } from '@admin/@generated'

@ObjectType({ description: 'contestWithParticipants' })
export class ContestWithParticipants extends Contest {
  @Field(() => Int)
  participants: number
}
