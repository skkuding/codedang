import { auth } from '@/libs/auth'
import { notFound, redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { BlueprintWorkspace } from '../_components/BlueprintWorkspace'
import { blueprintBaseHref, parseBlueprintId } from '../_libs/routes'

export default async function BlueprintLayout({
  children,
  params
}: {
  children: ReactNode
  params: Promise<{ blueprintId: string }>
}) {
  const { blueprintId: value } = await params
  const blueprintId = parseBlueprintId(value)
  if (blueprintId === null) {
    notFound()
  }
  if (!(await auth())) {
    redirect(
      `/login?${new URLSearchParams({ redirectUrl: blueprintBaseHref(blueprintId) })}`
    )
  }
  return (
    <BlueprintWorkspace blueprintId={blueprintId}>
      {children}
    </BlueprintWorkspace>
  )
}
