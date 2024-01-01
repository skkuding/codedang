'use client'

import { useToast } from '@/components/ui/use-toast'
import { IoIosLink } from 'react-icons/io'
import { RiGithubFill } from 'react-icons/ri'
import { RiKakaoTalkFill } from 'react-icons/ri'
import { TbMailFilled } from 'react-icons/tb'

export default function Footer() {
  const { toast } = useToast()
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText('skkucodingplatform@gmail.com')
      toast({
        description: 'Email Copied!',
        variant: 'success'
      })
    } catch (err) {
      console.error('clipboard failed', err)
    }
  }
  return (
    <footer className="w-full items-center py-7">
      <div className="flex h-20 w-full flex-col items-center justify-center gap-2 bg-gray-100 text-slate-500">
        <div className="flex flex-row items-center justify-center gap-4">
          <a
            href="https://pf.kakao.com/_UKraK/chat"
            rel="noreferrer noopener"
            target="_blank"
          >
            <RiKakaoTalkFill
              className="cursor-pointer hover:text-slate-600"
              size="24"
            />
          </a>
          <TbMailFilled
            onClick={copyToClipboard}
            className="cursor-pointer hover:text-slate-600"
            size="24"
          />
          <a
            rel="noreferrer noopener"
            target="_blank"
            href="https://github.com/skkuding/"
          >
            <RiGithubFill
              className="cursor-pointer hover:text-slate-600"
              size="24"
            />
          </a>
          <a
            rel="noreferrer noopener"
            target="_blank"
            href="https://skkuding.dev/"
          >
            <IoIosLink
              className="cursor-pointer hover:text-slate-600"
              size="23"
            />
          </a>
        </div>
        <div>
          <p className="text-sm font-bold">
            (c) SKKUDING &nbsp;&nbsp;/ Since 2021
          </p>
        </div>
      </div>
    </footer>
  )
}
