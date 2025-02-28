import { InputType, Field, Int } from '@nestjs/graphql'

@InputType()
export class UpdateAnnouncementInput {
  @Field(() => Int, { description: 'id of announcement', nullable: false })
  id: number

  @Field(() => String, {
    description: 'content of announcement',
    nullable: true
  })
  content?: string
}
