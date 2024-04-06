import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType({ description: 'image' })
export class ImageSource {
  @Field(() => String)
  src: string
}
