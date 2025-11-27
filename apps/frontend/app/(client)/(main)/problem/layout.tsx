import { Cover } from '@/app/(client)/(main)/_components/Cover'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Cover
        title="PROBLEM"
        description="Train Hard, Solve Fast, Code Like a Pro!"
      />
      <div className="flex w-full max-w-[1440px] flex-col gap-5 px-5 py-8 sm:px-6 md:px-[116px]">
        {children}
      </div>
    </>
  )
}
