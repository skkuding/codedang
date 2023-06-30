import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType({ description: 'respondContestPublicizingRequest' })
export class RespondContestPublicizingRequest {
  @Field()
  accepted: boolean
}
