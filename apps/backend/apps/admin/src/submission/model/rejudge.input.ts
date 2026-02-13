/* eslint-disable @typescript-eslint/naming-convention */
import { Field, InputType, Int, registerEnumType } from '@nestjs/graphql'
import { IsEnum, IsInt, IsPositive } from 'class-validator'

export enum RejudgeMode {
  CREATE_NEW = 'CREATE_NEW',
  REPLACE_EXISTING = 'REPLACE_EXISTING'
}

registerEnumType(RejudgeMode, {
  name: 'RejudgeMode',
  description: '재채점 모드'
})

@InputType()
export class RejudgeInput {
  @Field(() => Int)
  @IsInt()
  @IsPositive()
  assignmentId: number

  @Field(() => Int)
  @IsInt()
  @IsPositive()
  problemId: number

  @Field(() => RejudgeMode)
  @IsEnum(RejudgeMode)
  mode: RejudgeMode
}
