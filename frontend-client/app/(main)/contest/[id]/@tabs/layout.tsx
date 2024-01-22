import ContestTabs from '../../_components/ContestTabs'
import type { ContestDetailProps } from '../layout'

export default function Layout({
  children,
  params
}: {
  children: React.ReactNode
  params: ContestDetailProps['params']
}) {
  const { id } = params
  return (
    <>
      <ContestTabs contestId={id} />
      {children}
    </>
  )
}
