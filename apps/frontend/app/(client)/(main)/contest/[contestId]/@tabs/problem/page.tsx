import { ContestProblemListTable } from './_components/ContestProblemListTable'

interface ContestProblemProps {
  params: { contestId: string }
}

export default async function Page({ params }: ContestProblemProps) {
  const { contestId } = params

  /**TODO: add error boundary (handling unexpected error) */
  return <ContestProblemListTable contestId={Number(contestId)} />
}
