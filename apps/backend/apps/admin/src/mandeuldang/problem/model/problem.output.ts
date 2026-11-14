import { Field, Int, ObjectType } from '@nestjs/graphql'
import { CollaboratorRole, Problem } from '@admin/@generated'

/**
 * Mandeuldang problem returned by list and detail queries.
 * Relation and computed fields are populated only by the detail query
 * and are left undefined in list queries.
 */
@ObjectType()
export class MandeuldangProblemOutput extends Problem {
  @Field(() => CollaboratorRole, {
    nullable: true,
    description:
      'Collaboration role of the requester. Null if the requester is not an Owner, Editor, or Reviewer.'
  })
  myRole?: `${CollaboratorRole}` | null

  @Field(() => Int, {
    nullable: true,
    description:
      'Number of uploaded test files, counted individually rather than as in/out pairs.'
  })
  testFileCount?: number

  @Field(() => Boolean, {
    nullable: true,
    description:
      'Whether the problem can be published. Computed only in the detail query.'
  })
  canPublish?: boolean

  @Field(() => [String], {
    nullable: true,
    description:
      'Missing items when canPublish is false (STATEMENT, SOLUTION, TEST_FILES).'
  })
  missingForPublish?: string[]
}
