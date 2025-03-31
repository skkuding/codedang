import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType({ description: 'file' })
export class FileSource {
  @Field(() => String)
  src: string
}
