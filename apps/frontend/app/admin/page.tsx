import welcomeLogo from '@/public/logos/welcome.png'
import { useTranslate } from '@tolgee/react'
import Image from 'next/image'

export default function Page() {
  const { t } = useTranslate()
  return (
    <main className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 transform flex-col items-center">
      <Image
        className="pb-10"
        src={welcomeLogo}
        alt={t('welcome_image_alt')}
        width={454}
        height={262}
      />
      <p className="text-center font-['IBM_Plex_Mono'] text-[40px] font-bold leading-[46px] text-[#0760EF]">
        {t('thanks_for_using_codedang')}
      </p>
      <p className="text-slate-[#000] gap-6 text-center font-light leading-[50px]">
        {t('easily_manage_problems_and_contests')}
      </p>
    </main>
  )
}
