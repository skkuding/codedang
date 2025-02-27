import { Cover } from '@/app/(client)/(main)/_components/Cover'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Cover
        title="PROBLEM"
        description="Train Hard, Solve Fast, Code Like a Pro!"
      />
      <div className="flex w-full max-w-7xl flex-col gap-5 p-5 py-8">
        {children}
      </div>
    </>
  )
}
