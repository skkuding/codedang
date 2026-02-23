import { Button } from '@/components/shadcn/button'
import welcome from '@/public/logos/welcome.png'
import { useAuthModalStore } from '@/stores/authModal'
import { useTranslate } from '@tolgee/react'
import Image from 'next/image'

export function SignUpWelcome() {
  const { hideModal } = useAuthModalStore((state) => state)
  const { t } = useTranslate()
  return (
    <div className="flex h-full flex-col items-center justify-between">
      <div className="flex flex-1 flex-col items-center justify-center">
        <Image
          src={welcome}
          alt={t('welcome_image_alt')}
          height={220}
          width={220}
        />
        <div className="mt-[25px] text-center">
          <p className="text-xl font-medium">{t('welcome_message')}</p>
          <p className="text-color-neutral-70 mb-[30px] text-sm font-normal">
            {t('account_created_message')}
          </p>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full px-[22px] py-[9px] text-base font-medium"
        onClick={hideModal}
      >
        {t('start_codedang_button')}
      </Button>
    </div>
  )
}
