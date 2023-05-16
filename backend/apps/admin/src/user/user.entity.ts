import { ObjectType, Field, ID } from '@nestjs/graphql'

@ObjectType()
export class UserDto {
  @Field(() => ID)
  id: number

  @Field(() => String)
  title: string

  @Field(() => String)
  text: string

  @Field(() => Boolean)
  isPublished: boolean
}
