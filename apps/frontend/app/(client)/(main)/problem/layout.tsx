import { ProblemTabs } from './_components/ProblemTabs'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-30 px-29 inline-flex w-full max-w-[1440px] flex-col items-start justify-start">
      <div className="pb-15 flex justify-between self-stretch">
        <div className="flex flex-col items-start justify-start gap-1">
          <div className="text-head1_b_40 justify-start self-stretch">
            Problem
          </div>
          <div className="text-sub2_m_18 text-CoolNeutral-40 justify-start">
            Train Hard, Solve Fast, Code Like a Pro!
          </div>
        </div>
        <ProblemTabs />
      </div>
      {children}
    </div>
  )
}
