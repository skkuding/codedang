import { Field, InputType, Int } from '@nestjs/graphql'
import { CollaboratorRole } from '@generated'
import { IsEmail, IsEnum, IsInt } from 'class-validator'

@InputType()
export class CollaboratorInput {
  @Field(() => String)
  @IsEmail()
  userEmail!: string

  @Field(() => CollaboratorRole)
  @IsEnum(CollaboratorRole)
  role!: CollaboratorRole
}

@InputType()
export class CollaboratorUpdateInput {
  @Field(() => Int)
  @IsInt()
  userId!: number

  @Field(() => CollaboratorRole)
  @IsEnum(CollaboratorRole)
  role!: CollaboratorRole
}
