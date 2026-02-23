'use client'

import { Button } from '@/components/shadcn/button'
import codedangLogo from '@/public/logos/codedang-with-text.svg'
import { useTranslate } from '@tolgee/react'
import type { Route } from 'next'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { IoWarningOutline } from 'react-icons/io5'

export function UpdateInformation() {
  const { t } = useTranslate()
  const router = useRouter()
  return (
    <div className="flex w-full flex-col items-center gap-1">
      <div className="flex justify-center pt-4">
        <Image
          className="absolute top-4"
          src={codedangLogo}
          alt="codedang"
          width={100}
        />
      </div>
      <div className="mt-20 inline-flex items-center text-center font-mono text-xl font-bold text-red-500">
        <IoWarningOutline />
        <p className="pl-2">{t('update_information')}</p>
      </div>
      <div className="my-6 flex flex-col gap-2 text-center text-xs text-neutral-700">
        <p>
          {t('must_update_information_1')}
          <span className="font-bold">{t('must_update_information_2')}</span>
        </p>
        <p>{t('must_update_information_3')}</p>
      </div>
      <ul className="flex flex-col gap-2 text-xs font-medium text-neutral-700">
        <li className="list-disc">{t('student_id')}</li>
        <li className="list-disc">{t('first_major')}</li>
      </ul>
      <Button
        className="mt-8 w-full bg-red-500 font-semibold hover:bg-red-600"
        onClick={() => {
          router.push(
            (`/settings` +
              `?${new URLSearchParams({ updateNow: 'true' })}`) as Route
          )
        }}
      >
        {t('update_now')}
      </Button>
    </div>
  )
}
