import { ObjectType, OmitType } from '@nestjs/graphql'
import { BlueprintAssignmentProblem } from '@generated'

// Excludes relations that the service does not load.
@ObjectType()
export class BlueprintAssignmentProblemOutput extends OmitType(
  BlueprintAssignmentProblem,
  ['problem', 'blueprintAssignment'] as const
) {}
