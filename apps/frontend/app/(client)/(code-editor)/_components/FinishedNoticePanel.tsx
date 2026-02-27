import { Button } from '@/components/shadcn/button'
import { fetcher } from '@/libs/utils'
import exitIcon from '@/public/icons/exit2.svg'
import visitIcon from '@/public/icons/visit.svg'
import { getTranslate } from '@/tolgee/server'
import Image from 'next/image'
import Link from 'next/link'

interface FinishedNoticePanelProps {
  target: 'assignment' | 'exercise' | 'contest'
  problemId: string
  assignmentId?: string
  courseId?: string
  contestId?: string
}

export async function FinishedNoticePanel({
  target,
  problemId,
  assignmentId,
  courseId,
  contestId
}: FinishedNoticePanelProps) {
  const t = await getTranslate()

  const isProblemPubliclyAvailable =
    (await fetcher.head(`problem/${problemId}`)).status === 200
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-opacity-10 text-center backdrop-blur-md">
      <p className="h-[58px] text-4xl font-bold text-white">
        {t('the_has_finished', { context: target })}
      </p>
      <p className="h-[56px] text-xl font-normal text-[#B0B0B0]">
        {isProblemPubliclyAvailable
          ? t('public_problem_solve_msg')
          : t('problem_no_longer_available_msg', { context: target })}
        <br />
        {t('click_button_to')}{' '}
        {contestId === undefined ? t('exit_page') : t('go_to_leaderboard')}
      </p>
      <div className="mt-[64px] flex gap-[24px]">
        {isProblemPubliclyAvailable && (
          <VisitProblemButton problemId={problemId} t={t} />
        )}
        {courseId && assignmentId && (
          <ExitButton
            courseId={courseId}
            assignmentId={assignmentId}
            target={target}
            t={t}
          />
        )}
        {contestId && (
          <ExitButton contestId={contestId} target={target} t={t} />
        )}
      </div>
    </div>
  )
}

interface VisitProblemButtonProps {
  problemId: string
  t: (key: string) => string
}

function VisitProblemButton({ problemId, t }: VisitProblemButtonProps) {
  return (
    <Link href={`/problem/${problemId}`}>
      <Button
        type="button"
        className="h-10 w-48 shrink-0 gap-[5px] rounded-[4px] border border-blue-500 bg-blue-100 font-sans text-blue-500 hover:bg-blue-300"
      >
        <Image src={visitIcon} alt="exit" width={20} height={20} />
        {t('visit_public_problem')}
      </Button>
    </Link>
  )
}

interface ExitButtonProps {
  target: 'assignment' | 'exercise' | 'contest'
  courseId?: string
  assignmentId?: string
  contestId?: string
  t: (key: string) => string
}

function ExitButton({
  target,
  courseId,
  assignmentId,
  contestId,
  t
}: ExitButtonProps) {
  const hrefMap = {
    assignment: `/course/${courseId}/assignment/${assignmentId}`,
    exercise: `/course/${courseId}/exercise/${assignmentId}`,
    contest: `/contest/${contestId}/leaderboard`
  } as const
  return (
    <Link href={hrefMap[target]}>
      <Button
        type="button"
        className="ml-4 h-10 shrink-0 gap-[5px] bg-blue-500 font-sans hover:bg-blue-700"
      >
        <Image src={exitIcon} alt="exit" width={20} height={20} />
        {target === 'contest' ? t('view_leaderboard') : t('exit')}
      </Button>
    </Link>
  )
}
