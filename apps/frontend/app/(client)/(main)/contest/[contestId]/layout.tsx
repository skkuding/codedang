import { ContestDetailHeader } from './_components/ContestDetailHeader'
import ContestTabs from './_components/ContestTabs'

interface ContestDetailLayoutProps {
  params: {
    contestId: string
  }
  tabs: React.ReactNode
}

export default async function Layout({
  params,
  tabs
}: ContestDetailLayoutProps) {
  const { contestId } = params
  return (
    <article>
      {/**TODO: add error boundary (handling unexpected error) */}
      <ContestDetailHeader contestId={contestId} />
      <ContestTabs contestId={contestId} />
      {tabs}
    </article>
  )
}
