import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Contest, ContestRole } from '@admin/@generated'

@ObjectType({ description: 'contestWithParticipants' })
export class ContestWithParticipants extends Contest {
  @Field(() => Int)
  participants: number
}

@ObjectType({ description: 'contest with participants and contest roles' })
export class ContestWithParticipantsAndRoles extends ContestWithParticipants {
  @Field(() => [UserContestRole])
  userContestRoles: UserContestRole[]
}

@ObjectType({ description: 'contest roles' })
export class UserContestRole {
  @Field(() => Int)
  userId: number

  @Field(() => ContestRole)
  role: ContestRole
}
