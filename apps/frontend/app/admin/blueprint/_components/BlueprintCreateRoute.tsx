'use client'

import { Button } from '@/components/shadcn/button'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { BlueprintCreateOptions } from '../_libs/createTypes'
import { blueprintKeys } from '../_libs/queries'
import { blueprintListHref } from '../_libs/routes'
import { useBlueprintRead } from '../_libs/useBlueprintRead'
import { BlueprintCreateForm } from './BlueprintCreateForm'
import { useBlueprintCreateSource } from './BlueprintCreateSourceProvider'
import { BlueprintProblemCatalogBoundary } from './BlueprintProblemCatalogBoundary'
import { BlueprintReadBoundary } from './BlueprintReadBoundary'
import { useBlueprintWorkspace } from './BlueprintWorkspace'

export function BlueprintCreateRoute() {
  const { blueprintId, kind, location } = useBlueprintWorkspace()
  const source = useBlueprintCreateSource()
  const router = useRouter()
  const options = useBlueprintRead(
    [...blueprintKeys.course(blueprintId), 'create-options'],
    source ? () => source.readOptions(blueprintId) : null
  )
  const [lastOptions, setLastOptions] = useState<{
    blueprintId: number
    data: BlueprintCreateOptions
  } | null>(null)
  useEffect(() => {
    if (options?.status === 'success') {
      setLastOptions({ blueprintId, data: options.data })
    } else if (
      options?.status === 'forbidden' ||
      options?.status === 'not-found'
    ) {
      setLastOptions(null)
    }
  }, [blueprintId, options])
  let data = lastOptions?.blueprintId === blueprintId ? lastOptions.data : null
  if (options?.status === 'success') {
    data = options.data
  }
  const denied =
    options?.status === 'forbidden' || options?.status === 'not-found'
  const back = () => router.push(blueprintListHref(blueprintId, kind, location))

  return (
    <>
      {options === null && (
        <div className="mt-10 flex flex-col items-start gap-6">
          <p role="status">
            Blueprint creation is not connected. No content has been created.
          </p>
          <Button variant="outline" onClick={back}>
            Back to list
          </Button>
        </div>
      )}
      {options !== null && options.status !== 'success' && (
        <BlueprintReadBoundary state={options}>
          {() => null}
        </BlueprintReadBoundary>
      )}
      {data !== null && !denied && (
        <div>
          <BlueprintProblemCatalogBoundary key={`${blueprintId}:${kind}`}>
            {(problemCatalog) => (
              <BlueprintCreateForm
                key={`${blueprintId}:${kind}`}
                isExercise={kind === 'exercise'}
                options={data}
                problemCatalog={problemCatalog}
                optionsReady={options?.status === 'success'}
                onCancel={back}
              />
            )}
          </BlueprintProblemCatalogBoundary>
        </div>
      )}
    </>
  )
}
