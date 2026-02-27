import comingSoonLogo from '@/public/logos/coming-soon.png'
import { getTranslate } from '@/tolgee/server'
import Image from 'next/image'

export default async function Page() {
  const t = await getTranslate()
  return (
    <div className="container mx-auto space-y-5 py-10">
      <div className="flex flex-col items-center justify-center py-[218px]">
        <Image
          className="pb-10"
          src={comingSoonLogo}
          alt="coming-soon"
          width={300}
          height={300}
        />
        <div className="flex flex-col items-center">
          <h2 className="pb-2 text-xl font-semibold">
            {t('coming_soon_title')}
          </h2>
          <p className="text-center text-base text-neutral-500">
            {t('coming_soon_message')}
            <br /> {t('coming_soon_update')}
          </p>
        </div>
      </div>
    </div>
  )
}
