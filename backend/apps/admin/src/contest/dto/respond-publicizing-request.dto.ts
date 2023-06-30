import { Field, InputType } from '@nestjs/graphql'
import { IsBoolean, IsNotEmpty } from 'class-validator'

@InputType()
export class RespondContestPublicizingRequestDto {
  @Field()
  @IsBoolean()
  @IsNotEmpty()
  readonly accepted: boolean
}
