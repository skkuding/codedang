import { Cover } from '@/app/(client)/(main)/_components/Cover'
import { getTranslate } from '@/tolgee/server'

export default async function Layout({
  children
}: {
  children: React.ReactNode
}) {
  const t = await getTranslate()
  return (
    <>
      <Cover
        title={t('problem_title')}
        description={t('problem_description')}
      />
      <div className="flex w-full max-w-[1440px] flex-col gap-5 px-5 py-8 sm:px-6 md:px-[116px]">
        {children}
      </div>
    </>
  )
}
