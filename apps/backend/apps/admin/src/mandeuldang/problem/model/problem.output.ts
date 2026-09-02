import { ObjectType, PickType } from '@nestjs/graphql'
import { Problem } from '@generated'

// TODO(TAS-Read): Replace or extend this temporary output
// MandeuldangProblemOutput owned by the Read task.
@ObjectType()
export class MandeuldangProblemOutput extends PickType(Problem, [
  'id',
  'title',
  'creationMode',
  'status',
  'problemType'
] as const) {}
