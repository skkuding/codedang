import { InputType, Int, Field } from '@nestjs/graphql'

@InputType()
export class CreateAnnouncementInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number
}
