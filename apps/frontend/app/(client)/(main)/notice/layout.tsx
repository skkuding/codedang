import { Cover } from '@/app/(client)/(main)/_components/Cover'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Cover title="NOTICE" description="Here's an Update from the CODEDANG" />
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-2 py-4 sm:px-5 md:gap-5 md:px-10 md:py-8 lg:px-16 xl:px-[116px]">
        {children}
      </div>
    </>
  )
}
