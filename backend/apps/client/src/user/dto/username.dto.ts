import { IsAlphanumeric, IsNotEmpty } from 'class-validator'

export class UsernameDto {
  @IsAlphanumeric()
  @IsNotEmpty()
  readonly username: string
}
