import { Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql'
import { PickType } from '@nestjs/graphql'
import { CollaboratorRole, CollaboratorStatus } from '@admin/@generated'
import { MandeuldangCollaborator } from '@admin/@generated'

@ObjectType()
export class CollaboratorInviterOutput {
  @Field(() => Int)
  id!: number

  @Field(() => String)
  username!: string
}

@ObjectType()
export class CollaboratorOutput {
  // 협업자 레코드 ID가 아니라 참여자의 사용자 ID
  @Field(() => Int)
  id!: number

  @Field(() => String)
  username!: string

  @Field(() => String)
  email!: string

  @Field(() => CollaboratorRole)
  role!: `${CollaboratorRole}`

  @Field(() => CollaboratorStatus)
  status!: `${CollaboratorStatus}`

  @Field(() => CollaboratorInviterOutput, { nullable: true })
  invitedBy!: CollaboratorInviterOutput | null

  @Field(() => GraphQLISODateTime, { nullable: true })
  invitedAt!: Date | null

  @Field(() => GraphQLISODateTime, { nullable: true })
  approvedAt!: Date | null

  @Field(() => GraphQLISODateTime)
  createTime!: Date
}

@ObjectType()
export class CollaboratorMutationOutput extends PickType(
  MandeuldangCollaborator,
  [
    'id',
    'problemId',
    'userId',
    'role',
    'status',
    'invitedById',
    'invitedAt',
    'approvedAt',
    'createTime'
  ] as const
) {}
