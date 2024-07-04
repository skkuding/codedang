'use client'

import { IoIosLink } from 'react-icons/io'
import { RiGithubFill } from 'react-icons/ri'
import { RiKakaoTalkFill } from 'react-icons/ri'
import { TbMail } from 'react-icons/tb'
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
    <footer className="mt-8 flex h-[100px] w-full items-center justify-center bg-gray-50 md:h-[125px] md:items-end">
      <div className="flex w-full max-w-7xl flex-col justify-center gap-1 p-5 text-gray-400 md:flex-row md:justify-between md:gap-3">
        <p className="text-center text-sm font-bold">
          (c) SKKUDING / Since 2021
        </p>
        <div className="flex items-center justify-center gap-4">
          <a
            href="https://pf.kakao.com/_UKraK/chat"
            rel="noreferrer noopener"
            target="_blank"
          >
            <RiKakaoTalkFill
              className="cursor-pointer hover:text-gray-500"
              size="27"
            />
          </a>
          <TbMail
            onClick={copyToClipboard}
            className="cursor-pointer hover:text-gray-500"
            size="27"
          />
          <a
            rel="noreferrer noopener"
            target="_blank"
            href="https://github.com/skkuding/"
          >
            <RiGithubFill
              className="cursor-pointer hover:text-gray-500"
              size="27"
            />
          </a>
          <a
            rel="noreferrer noopener"
            target="_blank"
            href="https://skkuding.dev/"
          >
            <IoIosLink
              className="cursor-pointer hover:text-gray-500"
              size="26"
            />
          </a>
        </div>
      </div>
    </footer>
  )
}
