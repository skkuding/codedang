'use client'

import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'
import { useState } from 'react'
import { IoIosLink } from 'react-icons/io'
import { RiGithubFill } from 'react-icons/ri'
import { RiKakaoTalkFill } from 'react-icons/ri'
import { TbMailFilled } from 'react-icons/tb'

export default function Footer() {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText('testtest1')
      setCopied(true)
    } catch (err) {
      console.error('clipboard failed', err)
    }
  }
  return (
    <footer className=" items-center py-7">
      <div className="flex h-20 w-full flex-col items-center justify-center gap-2 bg-gray-100">
        <div className="flex flex-row items-center justify-center gap-4">
          <Link href="https://pf.kakao.com/_UKraK/chat">
            <RiKakaoTalkFill
              className="cursor-pointer text-gray-500"
              size="24"
            />
          </Link>
          <TbMailFilled
            onClick={copyToClipboard}
            className="cursor-pointer text-gray-500"
            size="24"
          />
          <Link href="https://github.com/skkuding/">
            <RiGithubFill className="cursor-pointer text-gray-500" size="24" />
          </Link>
          <Link href="https://skkuding.dev/">
            <IoIosLink className="cursor-pointer text-gray-500" size="23" />
          </Link>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-500">
            (c) SKKUDING &nbsp;&nbsp;/ Since 2021
          </p>
        </div>
      </div>
      {copied && (
        <>
          <Toaster />
          {toast({ description: 'Email Copied!' })}
          {console.log('copied!')}
          {setCopied(false)}
        </>
      )}
    </footer>
  )
}
