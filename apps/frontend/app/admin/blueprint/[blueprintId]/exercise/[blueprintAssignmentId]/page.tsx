import { notFound } from 'next/navigation'
import { BlueprintDetailRoute } from '../../../_components/BlueprintRouteContent'
import { parseBlueprintId } from '../../../_libs/routes'

export default async function BlueprintExercise({
  params
}: {
  params: Promise<{ blueprintAssignmentId: string }>
}) {
  const assignmentId = parseBlueprintId((await params).blueprintAssignmentId)
  if (assignmentId === null) {
    notFound()
  }
  return <BlueprintDetailRoute assignmentId={assignmentId} />
}
