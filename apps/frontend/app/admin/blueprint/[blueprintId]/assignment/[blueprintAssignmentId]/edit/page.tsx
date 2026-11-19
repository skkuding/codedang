import { notFound } from 'next/navigation'
import { BlueprintEditRoute } from '../../../../_components/BlueprintEditRoute'
import { parseBlueprintId } from '../../../../_libs/routes'

export default async function BlueprintAssignmentEditPage({
  params
}: {
  params: Promise<{ blueprintAssignmentId: string }>
}) {
  const assignmentId = parseBlueprintId((await params).blueprintAssignmentId)
  if (assignmentId === null) {
    notFound()
  }
  return <BlueprintEditRoute assignmentId={assignmentId} />
}
