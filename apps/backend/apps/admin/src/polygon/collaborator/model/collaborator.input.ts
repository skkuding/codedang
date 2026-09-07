import { InputType } from '@nestjs/graphql'
import { CollaboratorRole } from '@generated'
import { IsEmail, IsEnum, IsInt } from 'class-validator'

@InputType()
export class CollaboratorInput {
  @IsEmail()
  userEmail: string

  @IsEnum(CollaboratorRole)
  role: CollaboratorRole
}

@InputType()
export class CollaboratorUpdateInput {
  @IsInt()
  userId: number

  @IsEnum(CollaboratorRole)
  role: CollaboratorRole
}
