'use client'

import codedangLogo from '@/public/logos/codedang-with-text.svg'
import { useTranslate } from '@tolgee/react'
import Image from 'next/image'
import { AiOutlineLink } from 'react-icons/ai'
import { AiFillMail } from 'react-icons/ai'
import { RiKakaoTalkFill } from 'react-icons/ri'
import { TbBrandGithubFilled } from 'react-icons/tb'
import { toast } from 'sonner'

export function Footer() {
  const { t } = useTranslate()
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText('skkuding@gmail.com')
      console.log('clipboard successfully set')
      toast.success(t('email_copied_toast'))
    } catch (err) {
      console.error('clipboard failed', err)
    }
  }
  return (
    <footer className="h-100 mt-8 flex w-full flex-col items-center justify-center gap-10 bg-gray-50 md:h-80 md:items-center">
      <div className="flex min-w-fit items-center justify-center">
        <Image src={codedangLogo} alt="코드당" width={180} height={28} />
      </div>
      <div className="flex items-center justify-center gap-3">
        <a
          rel="noreferrer noopener"
          target="_blank"
          href="https://github.com/skkuding/"
          className="rounded border border-gray-200 p-1"
        >
          <TbBrandGithubFilled className="text-gray-500" size="17" />
        </a>
        <a
          href="https://pf.kakao.com/_UKraK/chat"
          rel="noreferrer noopener"
          target="_blank"
          className="rounded border border-gray-200 p-1"
        >
          <RiKakaoTalkFill className="text-gray-500" size="17" />
        </a>
        <AiFillMail
          onClick={copyToClipboard}
          className="rounded border border-gray-200 p-1 text-gray-500"
          size="27"
        />
        <a
          rel="noreferrer noopener"
          target="_blank"
          href="https://skkuding.dev/"
          className="rounded border border-gray-200 p-1"
        >
          <AiOutlineLink className="text-gray-500" size="17" />
        </a>
      </div>
      <div className="text-black-400 flex max-w-7xl flex-col justify-center gap-1 md:justify-center">
        <p className="text-center text-sm font-light">
          ⓒ 2025. CODEDANG All rights reserved.
        </p>
        <p className="text-center text-sm font-light">
          {t('since_2021_label')}
        </p>
      </div>
    </footer>
  )
}
