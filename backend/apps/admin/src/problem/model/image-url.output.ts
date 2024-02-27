import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType({ description: 'image-url' })
export class ImageUrl {
  @Field(() => String)
  imageUrl: string
}
