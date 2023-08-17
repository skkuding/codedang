import { InputType, Field, Int, PartialType } from '@nestjs/graphql'
import { CreateWorkbookproblemInput } from './create-workbookproblem.input'

@InputType()
export class UpdateWorkbookproblemInput extends PartialType(
  CreateWorkbookproblemInput
) {
  @Field(() => Int)
  id: number
}
