import type { Prisma } from '@prisma/client'
import { UnprocessableDataException } from '@libs/exception'

export const assertAssignmentUnlinked = (assignment: {
  blueprintAssignmentId?: number | null
}) => {
  if (assignment.blueprintAssignmentId != null) {
    throw new UnprocessableDataException(
      'Confirm unlinkBlueprintAssignment before editing this linked assignment'
    )
  }
}

export const lockBlueprintAssignment = async (
  tx: Prisma.TransactionClient,
  id: number
) => {
  await tx.$queryRaw`SELECT id FROM blueprint_assignment WHERE id = ${id} FOR UPDATE`
}
