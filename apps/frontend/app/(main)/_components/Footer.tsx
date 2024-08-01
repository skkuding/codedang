'use client'

import CodedangLogo from '@/public/codedang.svg'
import Image from 'next/image'
import { AiOutlineLink } from 'react-icons/ai'
import { AiFillMail } from 'react-icons/ai'
import { RiKakaoTalkFill } from 'react-icons/ri'
import { TbBrandGithubFilled } from 'react-icons/tb'
import { toast } from 'sonner'

export default function Footer() {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText('skkucodingplatform@gmail.com')
      console.log('clipboard successfully set')
      toast.success('Email Copied!')
    } catch (err) {
      console.error('clipboard failed', err)
    }
  }
  return (
    <footer className="mt-8 flex h-[380px] w-full flex-col items-center justify-center gap-8 bg-gray-50 md:h-[380px] md:items-center">
      <div
        className="flex min-w-fit items-center justify-center"
        style={{ width: '12.07613rem', height: '2.5rem' }}
      >
        <Image src={CodedangLogo} alt="코드당" width={180} height={28} />
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
          ⓒ 2024. CODEDANG All rights reserved.
        </p>
        <p className="text-center text-sm font-light">Since 2021</p>
      </div>
    </footer>
  )
}
