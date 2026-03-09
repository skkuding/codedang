import { ProblemTabs } from './_components/ProblemTabs'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-Background-Alternative mt-15">
      <div className="inline-flex w-full flex-col justify-center px-28 backdrop-blur-sm">
        <div className="flex flex-col items-start py-14">
          <div className="text-head1_b_40">Problem</div>
          <div className="text-sub2_m_18">
            Train Hard, Solve Fast, Code Like a Pro!
          </div>
        </div>
        <div className="w-full rounded-lg">
          <ProblemTabs />
          {children}
        </div>
      </div>
    </div>
  )
}
