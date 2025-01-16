import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Assignment } from '@admin/@generated'

@ObjectType({ description: 'assignmentWithParticipants' })
export class AssignmentWithParticipants extends Assignment {
  @Field(() => Int)
  participants: number
}
