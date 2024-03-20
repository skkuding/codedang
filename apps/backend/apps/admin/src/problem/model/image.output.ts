import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType({ description: 'image' })
export class Image {
  @Field(() => String)
  src: string
}
