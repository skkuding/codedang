import { Field, InputType, Int } from '@nestjs/graphql'
import { Language, Level, ProblemType } from '@generated'
import { IsOptional, IsPositive, Matches } from 'class-validator'

@InputType()
export class CreateMandeuldangProblemInput {
  @Field(() => String, { nullable: false })
  @Matches(/\S/, { message: 'Title cannot be empty' })
  title!: string

  @Field(() => ProblemType, { nullable: false })
  problemType!: ProblemType

  @Field(() => String, { nullable: true })
  description?: string | null

  @Field(() => String, { nullable: true })
  inputDescription?: string | null

  @Field(() => String, { nullable: true })
  outputDescription?: string | null

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsPositive({ message: 'Time limit must be greater than zero' })
  timeLimit?: number | null

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsPositive({ message: 'Memory limit must be greater than zero' })
  memoryLimit?: number | null

  @Field(() => Level, { nullable: true })
  difficulty?: keyof typeof Level | null

  @Field(() => [Language], { nullable: true })
  languages?: Array<keyof typeof Language> | null
}
