'use client'

import {
  DataTable,
  DataTablePagination,
  DataTableRoot
} from '@/app/admin/_components/table'
import { OVERVIEW_CHECK_BY_ASSIGNMENT_PROBLEM_ID } from '@/graphql/check/queries'
import { GET_ASSIGNMENT_PROBLEMS } from '@/graphql/problem/queries'
import { useQuery, useSuspenseQuery } from '@apollo/client'
import { useParams } from 'next/navigation'
import { useCallback, useMemo, useState, useEffect } from 'react'
import { ProblemSelectDropdown } from '../../assessment/_components/DataTableProblemFilterSingle'
import { PlagiarismCheckRequestButton } from './PlagiarismCheckRequestButton'
import { PlagiarismClusterDialog } from './PlagiarismClusterDialog'
import { PlagiarismCodeComparisonDialog } from './PlagiarismCodeComparisonDialog'
import {
  createPlagiarismResultColumns,
  type PlagiarismResult
} from './PlagiarismResultTableColumns'

interface PlagiarismResultTableProps {
  selectedProblemId: number | null
  onProblemSelect: (problemId: number | null) => void
}

export function PlagiarismResultTable({
  selectedProblemId,
  onProblemSelect
}: PlagiarismResultTableProps) {
  const { courseId, assignmentId } = useParams()
  const [selectedResult, setSelectedResult] = useState<PlagiarismResult | null>(
    null
  )
  const [clusterDialogOpen, setClusterDialogOpen] = useState(false)
  const [selectedClusterId, setSelectedClusterId] = useState<number | null>(
    null
  )

  const problems = useSuspenseQuery(GET_ASSIGNMENT_PROBLEMS, {
    variables: {
      groupId: Number(courseId),
      assignmentId: Number(assignmentId)
    }
  })

  const problemData = problems.data.getAssignmentProblems
    .slice()
    .sort((a, b) => a.order - b.order)

  useEffect(() => {
    if (problemData?.length && !selectedProblemId) {
      onProblemSelect(problemData[0].problemId)
    }
  }, [problemData, selectedProblemId, onProblemSelect])

  const selectedPid = selectedProblemId ?? problemData?.[0]?.problemId

  const overviewQuery = useQuery(OVERVIEW_CHECK_BY_ASSIGNMENT_PROBLEM_ID, {
    variables: {
      assignmentId: Number(assignmentId),
      problemId: selectedPid ?? 0,
      take: 100,
      cursor: null
    },
    skip: !selectedPid,
    errorPolicy: 'all'
  })

  const refetchOverview = useCallback(() => {
    overviewQuery.refetch()
  }, [overviewQuery])

  const results: PlagiarismResult[] = useMemo(
    () =>
      (overviewQuery.data?.overviewCheckByAssignmentProblemId ?? [])
        .filter(
          (item) =>
            item.firstCheckSubmission?.id !== null &&
            item.firstCheckSubmission?.id !== undefined &&
            item.secondCheckSubmission?.id !== null &&
            item.secondCheckSubmission?.id !== undefined
        )
        .map((item) => {
          const firstSubmission = item.firstCheckSubmission
          const secondSubmission = item.secondCheckSubmission
          if (!firstSubmission || !secondSubmission) {
            throw new Error('Unexpected null submission after filter')
          }
          return {
            id: item.id,
            averageSimilarity: item.averageSimilarity,
            maxSimilarity: item.maxSimilarity,
            maxLength: item.maxLength,
            longestMatch: item.longestMatch,
            firstSimilarity: item.firstSimilarity,
            secondSimilarity: item.secondSimilarity,
            clusterId: item.clusterId ?? null,
            cluster: item.cluster ?? null,
            firstCheckSubmissionId: firstSubmission.id,
            secondCheckSubmissionId: secondSubmission.id,
            firstStudentId: firstSubmission.user?.studentId ?? null,
            secondStudentId: secondSubmission.user?.studentId ?? null
          }
        }),
    [overviewQuery.data]
  )

  const showEmptyState = !overviewQuery.loading && results.length === 0

  const sortedResults = useMemo(
    () =>
      [...results].sort((a, b) => b.averageSimilarity - a.averageSimilarity),
    [results]
  )

  const handleClusterClick = useCallback((cid: number) => {
    setSelectedClusterId(cid)
    setClusterDialogOpen(true)
  }, [])

  const columns = useMemo(
    () =>
      createPlagiarismResultColumns(
        setSelectedResult,
        handleClusterClick,
        sortedResults
      ),
    [handleClusterClick, sortedResults]
  )

  const hasProblems = problemData.length > 0

  const problemsForDropdown = problemData.map((p) => ({
    problemId: p.problemId,
    title: p.problem?.title ?? '',
    order: p.order
  }))

  if (!hasProblems) {
    return (
      <div className="py-8 text-center text-gray-500">
        No problems are available for this assignment.
      </div>
    )
  }

  if (!selectedPid) {
    return (
      <div className="py-8 text-center text-gray-500">
        Please select a problem.
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-lg font-semibold">Problem:</span>
          <ProblemSelectDropdown
            problems={problemsForDropdown}
            selectedProblemId={selectedPid}
            onSelect={(id) => onProblemSelect(id)}
          />
          {selectedPid && (
            <PlagiarismCheckRequestButton
              problemId={selectedPid}
              onRequestComplete={refetchOverview}
              disabled={false}
            />
          )}
        </div>

        {overviewQuery.loading && (
          <div className="py-8 text-center text-gray-500">Loading...</div>
        )}
        {!overviewQuery.loading && showEmptyState && (
          <div className="py-8 text-center text-gray-500">
            No plagiarism results. Request a check using the button above.
          </div>
        )}
        {!overviewQuery.loading && !showEmptyState && (
          <DataTableRoot
            columns={columns}
            data={sortedResults}
            defaultPageSize={20}
            defaultSortState={[{ id: 'averageSimilarity', desc: true }]}
          >
            <DataTable />
            <DataTablePagination />
          </DataTableRoot>
        )}
      </div>

      <PlagiarismClusterDialog
        open={clusterDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setClusterDialogOpen(false)
            setSelectedClusterId(null)
          }
        }}
        clusterId={selectedClusterId}
        results={sortedResults}
      />

      {selectedResult !== null && (
        <PlagiarismCodeComparisonDialog
          result={selectedResult}
          open
          onOpenChange={(open) => {
            if (!open) {
              setSelectedResult(null)
            }
          }}
        />
      )}
    </>
  )
}
