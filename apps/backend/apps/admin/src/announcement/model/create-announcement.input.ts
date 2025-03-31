import { InputType, Int, Field } from '@nestjs/graphql'

@InputType()
export class CreateAnnouncementInput {
  @Field(() => Int, {
    description: 'related problemOrder of announcement',
    nullable: true
  })
  problemOrder?: number

  @Field(() => String, {
    description: 'content of announcement',
    nullable: false
  })
  content: string
}
