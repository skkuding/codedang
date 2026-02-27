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
        title={t('notice_title')}
        description={t('here_is_an_update_from_the_codedang')}
      />
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-2 py-4 sm:px-5 md:gap-5 md:px-10 md:py-8 lg:px-16 xl:px-[116px]">
        {children}
      </div>
    </>
  )
}
