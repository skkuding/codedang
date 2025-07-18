import { Cover } from '@/app/(client)/(main)/_components/Cover'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Cover title="NOTICE" description="Here's an Update from the CODEDANG" />
      <div className="flex w-full max-w-[1440px] flex-col gap-5 px-[116px] py-8">
        {children}
      </div>
    </>
  )
}
