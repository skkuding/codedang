import type { Dispatch, SetStateAction } from 'react'

interface ContestQnaResolvedTabProps {
  clickUnanswered: boolean
  setClickUnanswered: Dispatch<SetStateAction<boolean>>
}

export function ContestQnaResolvedTab({
  clickUnanswered,
  setClickUnanswered
}: ContestQnaResolvedTabProps) {
  const tabClass =
    'w-48 h-9 rounded-full flex justify-center items-center cursor-pointer'
  const activeClass = 'bg-primary text-white'
  const inactiveClass = 'text-[#8A8A8A]'

  return (
    <div className="outline-line flex h-[46px] w-[360px] rounded-full p-[5px] text-sm text-[#8A8A8A] outline">
      <div
        className={`${tabClass} ${!clickUnanswered ? activeClass : inactiveClass}`}
        onClick={() => setClickUnanswered(false)}
      >
        All Question
      </div>
      <div
        className={`${tabClass} ${clickUnanswered ? activeClass : inactiveClass}`}
        onClick={() => setClickUnanswered(true)}
      >
        Unanswered Question
      </div>
    </div>
  )
}
