'use client'

import { Button } from '@/components/shadcn/button'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useBlueprintManagementSource } from '../_libs/BlueprintManagementSource'
import {
  isBlueprintDeletionImpact,
  isCompleteBlueprintEditData,
  type BlueprintEditData
} from '../_libs/editTypes'
import { uniqueProblems } from '../_libs/problemImport'
import { blueprintKeys } from '../_libs/queries'
import { blueprintDetailHref } from '../_libs/routes'
import { useBlueprintRead } from '../_libs/useBlueprintRead'
import { BlueprintCreateForm } from './BlueprintCreateForm'
import { BlueprintProblemCatalogBoundary } from './BlueprintProblemCatalogBoundary'
import { BlueprintReadBoundary } from './BlueprintReadBoundary'
import { useBlueprintWorkspace } from './BlueprintWorkspace'

export function BlueprintEditRoute({ assignmentId }: { assignmentId: number }) {
  const { blueprintId, kind, location } = useBlueprintWorkspace()
  const source = useBlueprintManagementSource()
  const router = useRouter()
  const state = useBlueprintRead(
    blueprintKeys.edit(blueprintId, assignmentId),
    source ? () => source.readEdit(blueprintId, assignmentId) : null
  )
  const impact = useBlueprintRead(
    blueprintKeys.deletionImpact(blueprintId, assignmentId),
    source ? () => source.readDeletionImpact(blueprintId, assignmentId) : null
  )
  const scopeKey = `${blueprintId}:${kind}:${assignmentId}`
  const current = state?.status === 'success' ? state.data : null
  const complete = isCompleteBlueprintEditData(current)
  const matches =
    complete &&
    current.blueprintId === blueprintId &&
    current.assignmentId === assignmentId &&
    current.isExercise === (kind === 'exercise')
  const [initial, setInitial] = useState<{
    key: string
    data: BlueprintEditData
  } | null>(null)
  useEffect(() => {
    if (matches) {
      setInitial((previous) =>
        previous?.key === scopeKey ? previous : { key: scopeKey, data: current }
      )
    } else if (state?.status === 'forbidden' || state?.status === 'not-found') {
      setInitial(null)
    }
  }, [current, matches, scopeKey, state?.status])
  let data = matches ? current : null
  if (initial?.key === scopeKey) {
    data = initial.data
  }
  const denied =
    state === null ||
    state.status === 'forbidden' ||
    state.status === 'not-found' ||
    (state.status === 'success' && complete && !matches)
  const problemChangesAllowed =
    impact?.status === 'success' &&
    isBlueprintDeletionImpact(impact.data) &&
    impact.data.deletable &&
    impact.data.submissionCount === 0 &&
    impact.data.recordedStudentCount === 0
  const back = () =>
    router.push(blueprintDetailHref(blueprintId, kind, assignmentId, location))

  return (
    <div className="flex flex-col gap-6">
      {state === null && (
        <p role="status" className="mt-10">
          Blueprint editing is not connected. No content has been updated.
        </p>
      )}
      {state !== null && state.status !== 'success' && (
        <BlueprintReadBoundary state={state}>
          {() => null}
        </BlueprintReadBoundary>
      )}
      {state?.status === 'success' && !complete && (
        <p role="alert" className="mt-10">
          Complete edit information is unavailable. Existing settings have not
          been replaced with defaults. Dates must use Asia/Seoul local input
          format and Week must match the provided options.
        </p>
      )}
      {complete && !matches && (
        <p role="alert">This Blueprint content could not be found.</p>
      )}
      {(data === null || denied) && (
        <Button variant="outline" className="self-start" onClick={back}>
          Back to Master Information
        </Button>
      )}
      {data !== null && !denied && (
        <>
          <p role="status" className="mt-6 text-sm text-neutral-600">
            Blueprint updates are not connected. Section schedule and existing
            Solution update contracts still need confirmation.
          </p>
          {!problemChangesAllowed && (
            <div className="flex flex-col gap-3">
              {impact?.status === 'success' &&
                isBlueprintDeletionImpact(impact.data) &&
                (impact.data.submissionCount > 0 ||
                  impact.data.recordedStudentCount > 0) && (
                  <p role="alert" className="text-sm text-neutral-600">
                    Learning records prevent problem selection and score
                    changes. Order can still be changed.
                  </p>
                )}
              {impact !== null && impact.status !== 'success' && (
                <BlueprintReadBoundary state={impact}>
                  {() => null}
                </BlueprintReadBoundary>
              )}
            </div>
          )}
          <BlueprintProblemCatalogBoundary key={scopeKey}>
            {(catalog) => (
              <BlueprintCreateForm
                key={scopeKey}
                mode="edit"
                initialDraft={data.draft}
                isExercise={kind === 'exercise'}
                options={data.options}
                optionsReady={matches}
                problemChangesAllowed={problemChangesAllowed}
                problemCatalog={{
                  ...catalog,
                  problems: uniqueProblems([
                    ...data.problems,
                    ...catalog.problems
                  ])
                }}
                onCancel={back}
              />
            )}
          </BlueprintProblemCatalogBoundary>
        </>
      )}
    </div>
  )
}
