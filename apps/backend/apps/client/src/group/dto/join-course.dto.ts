import { IsNotEmpty, IsNumberString } from 'class-validator'

export class JoinCourseDto {
  @IsNumberString()
  @IsNotEmpty()
  readonly studentId: string
}
