'use client'

import { IoIosLink } from 'react-icons/io'
import { RiGithubFill } from 'react-icons/ri'
import { RiKakaoTalkFill } from 'react-icons/ri'
import { TbMailFilled } from 'react-icons/tb'
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
    <footer className="mt-8 w-full items-center">
      <div className="flex h-[125px] w-full flex-col items-end justify-center gap-3 bg-gray-50 px-20 pb-[30px] text-gray-400 md:flex-row md:justify-between">
        <div>
          <p className="font-bold">(c) SKKUDING / Since 2021</p>
        </div>
        <div className="flex flex-row items-center justify-center gap-4">
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
          <TbMailFilled
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
              className="cursor-pointer hover:text-slate-600"
              size="26"
            />
          </a>
        </div>
      </div>
    </footer>
  )
}
