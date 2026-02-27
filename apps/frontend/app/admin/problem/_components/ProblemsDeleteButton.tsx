import { GET_BELONGED_CONTESTS } from '@/graphql/contest/queries'
import { DELETE_PROBLEM } from '@/graphql/problem/mutations'
import { GET_PROBLEMS } from '@/graphql/problem/queries'
import { useApolloClient, useLazyQuery, useMutation } from '@apollo/client'
import { useTranslate } from '@tolgee/react'
import { toast } from 'sonner'
import { DataTableDeleteButton } from '../../_components/table/DataTableDeleteButton'
import type { DataTableProblem } from './ProblemTableColumns'

export function ProblemsDeleteButton() {
  const client = useApolloClient()
  const [deleteProblem] = useMutation(DELETE_PROBLEM)
  const [fetchContests] = useLazyQuery(GET_BELONGED_CONTESTS)
  const { t } = useTranslate()

  const getCanDelete = async (data: DataTableProblem[]) => {
    const promises = data.map((item) =>
      fetchContests({
        variables: {
          problemId: Number(item.id)
        }
      })
    )

    const results = await Promise.all(promises)
    const isAllSafe = results.every(({ data }) => {
      const contests = data?.getContestsByProblemId
      return (
        contests?.finished.length === 0 &&
        contests.ongoing.length === 0 &&
        contests.upcoming.length === 0
      )
    })

    if (isAllSafe) {
      return true
    }

    toast.error(t('failed_problem_included_in_contest_error'))
    return false
  }

  const deleteTarget = (id: number) => {
    return deleteProblem({
      variables: {
        id
      }
    })
  }

  const onSuccess = () => {
    client.refetchQueries({
      include: [GET_PROBLEMS]
    })
  }

  return (
    <DataTableDeleteButton
      target="problem"
      getCanDelete={getCanDelete}
      deleteTarget={deleteTarget}
      onSuccess={onSuccess}
      className="ml-auto"
    />
  )
}
