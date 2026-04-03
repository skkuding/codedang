import { ProblemTabs } from './_components/ProblemTabs'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-30 px-29 inline-flex w-full max-w-[1440px] flex-col items-start justify-start">
      <div className="mb-15 flex justify-between self-stretch">
        <div className="flex flex-col items-start justify-start gap-1">
          <p className="text-head1_b_40 justify-start self-stretch">PROBLEM</p>
          <p className="text-color-cool-neutral-40 text-sub2_m_18 justify-start">
            열심히 훈련하고, 빠르게 해결하며, 프로답게 코드를 작성하세요!
          </p>
        </div>
        <ProblemTabs />
      </div>
      {children}
    </div>
  )
}
