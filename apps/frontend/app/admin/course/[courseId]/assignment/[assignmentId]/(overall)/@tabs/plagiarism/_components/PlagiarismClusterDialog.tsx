'use client'

import {
  DataTable,
  DataTablePagination,
  DataTableRoot
} from '@/app/admin/_components/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/shadcn/dialog'
import { GET_CLUSTER } from '@/graphql/check/queries'
import { useQuery } from '@apollo/client'
import type { DocumentNode } from 'graphql'
import { useState, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import {
  createClusterSubmissionColumns,
  type ClusterSubmissionRow
} from './PlagiarismClusterSubmissionColumns'
import { PlagiarismCodeComparisonView } from './PlagiarismCodeComparisonView'
import {
  buildClusterIdToDisplayNo,
  type PlagiarismResult
} from './PlagiarismResultTableColumns'

interface PlagiarismClusterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clusterId: number | null
  results: PlagiarismResult[]
}

type ViewMode = 'list' | 'comparison'

export function PlagiarismClusterDialog({
  open,
  onOpenChange,
  clusterId,
  results
}: PlagiarismClusterDialogProps) {
  const displayClusterNo = useMemo(
    () =>
      clusterId !== null
        ? (buildClusterIdToDisplayNo(results).get(clusterId) ?? null)
        : null,
    [results, clusterId]
  )
  const [view, setView] = useState<ViewMode>('list')
  const [selectedResult, setSelectedResult] = useState<PlagiarismResult | null>(
    null
  )
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState<number[]>(
    []
  )

  const { data, loading, error } = useQuery(GET_CLUSTER as DocumentNode, {
    variables: { clusterId: clusterId ?? 0 },
    skip: clusterId === null || !open,
    errorPolicy: 'all'
  })

  const cluster = data?.getCluster
  const submissionRows: ClusterSubmissionRow[] = useMemo(() => {
    const entries = cluster?.submissionClusterInfos
    if (!entries || entries.length === 0) {
      return []
    }
    return entries.map(
      (
        s: {
          submissionId: number
          user?: { studentId?: string | null } | null
        },
        index: number
      ) => ({
        id: index + 1,
        submissionId: s.submissionId,
        studentId: s.user?.studentId ?? null
      })
    )
  }, [cluster?.submissionClusterInfos])

  const handleToggleSubmission = useCallback((id: number) => {
    let shouldShowMaxToast = false

    setSelectedSubmissionIds((prev) => {
      const isSelected = prev.includes(id)

      // If already selected, unselect
      if (isSelected) {
        return prev.filter((x) => x !== id)
      }

      // If two are already selected, remember to show toast and ignore
      if (prev.length >= 2) {
        shouldShowMaxToast = true
        return prev
      }

      // Otherwise, add this submission
      return [...prev, id]
    })

    if (shouldShowMaxToast) {
      toast.error('You can select up to 2 submissions.')
    }
  }, [])

  const submissionColumns = useMemo(
    () =>
      createClusterSubmissionColumns(
        selectedSubmissionIds,
        handleToggleSubmission
      ),
    [selectedSubmissionIds, handleToggleSubmission]
  )

  const handleCompareSelected = useCallback(() => {
    if (selectedSubmissionIds.length !== 2 || clusterId === null) {
      return
    }
    const [a, b] = selectedSubmissionIds
    const candidate = results.find(
      (r) =>
        r.clusterId === clusterId &&
        ((r.firstCheckSubmissionId === a && r.secondCheckSubmissionId === b) ||
          (r.firstCheckSubmissionId === b && r.secondCheckSubmissionId === a))
    )

    if (!candidate) {
      return
    }

    setSelectedResult(candidate)
    setView('comparison')
  }, [selectedSubmissionIds, results, clusterId])

  const handleBackToList = useCallback(() => {
    setView('list')
    setSelectedResult(null)
  }, [])

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        // Reset local state when dialog is closed
        setSelectedSubmissionIds([])
        setSelectedResult(null)
        if (view === 'comparison') {
          setView('list')
          return
        }
        onOpenChange(false)
      } else {
        onOpenChange(true)
      }
    },
    [onOpenChange, view]
  )

  const averageSimilarityPercent = cluster
    ? (cluster.averageSimilarity * 100).toFixed(2)
    : null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex max-h-[85vh] max-w-4xl flex-col"
        style={
          view === 'comparison' ? { maxWidth: '95vw', height: '90vh' } : {}
        }
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {view === 'list'
              ? `Cluster #${displayClusterNo ?? clusterId ?? ''} — Comparison list`
              : `Code comparison — Similarity: ${
                  selectedResult
                    ? (selectedResult.averageSimilarity * 100).toFixed(2)
                    : 0
                }%`}
          </DialogTitle>
        </DialogHeader>

        {view === 'list' ? (
          <>
            {loading && (
              <div className="py-8 text-center text-gray-500">Loading...</div>
            )}
            {!loading && error && (
              <div className="py-8 text-center text-red-500">
                Failed to load cluster: {error.message}
              </div>
            )}
            {!loading && !error && cluster && (
              <div className="flex flex-col gap-4">
                <div className="flex gap-8 rounded-lg bg-gray-50 p-4 text-sm">
                  <div>
                    <div className="text-gray-600">
                      Cluster average similarity
                    </div>
                    <div className="text-lg font-semibold">
                      {averageSimilarityPercent}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Cluster strength</div>
                    <div className="text-lg font-semibold">
                      {cluster.strength.toFixed(4)}
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm">
                  Select two submissions in this cluster to compare.
                </p>

                <DataTableRoot
                  data={submissionRows}
                  columns={submissionColumns}
                  defaultPageSize={10}
                >
                  <DataTable size="sm" />
                  <DataTablePagination />
                </DataTableRoot>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleCompareSelected}
                    disabled={selectedSubmissionIds.length !== 2}
                    className="bg-primary rounded-md px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    Compare selected submissions
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          selectedResult !== null && (
            <PlagiarismCodeComparisonView
              result={selectedResult}
              onBack={handleBackToList}
              active={open}
            />
          )
        )}
      </DialogContent>
    </Dialog>
  )
}
