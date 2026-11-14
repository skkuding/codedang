import { notFound, redirect } from 'next/navigation'
import { blueprintListHref, parseBlueprintId } from '../_libs/routes'

export default async function BlueprintEntry({
  params
}: {
  params: Promise<{ blueprintId: string }>
}) {
  const blueprintId = parseBlueprintId((await params).blueprintId)
  if (blueprintId === null) {
    notFound()
  }
  redirect(blueprintListHref(blueprintId, 'assignment'))
}
