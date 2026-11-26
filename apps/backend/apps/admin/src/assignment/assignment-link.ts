import type { Prisma } from '@prisma/client'

export const lockBlueprintAssignment = async (
  tx: Prisma.TransactionClient,
  id: number
) => {
  await tx.$queryRaw`SELECT id FROM blueprint_assignment WHERE id = ${id} FOR UPDATE`
}
