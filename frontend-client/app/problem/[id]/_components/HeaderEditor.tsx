'use client'

import icon from '@/app/favicon.ico'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { FiUser } from 'react-icons/fi'
import { IoIosArrowForward } from 'react-icons/io'

interface HeaderEditorProps {
  id: number
  title: string
}

export default function HeaderEditor({ id, title }: HeaderEditorProps) {
  const [eng, setEng] = useState(false) // Eng
  return (
    <header className="flex h-12 shrink-0 justify-between bg-slate-800 px-4">
      <div className="flex items-center justify-center gap-6 font-bold text-slate-500">
        <Link href="/">
          <Image src={icon} alt="코드당" width={33} />
        </Link>
        <div className="flex items-center gap-1">
          <p>Problem</p>
          <IoIosArrowForward className="size-6" />
          <h1 className="text-lg font-bold text-white">{`#${id}. ${title}`}</h1>
        </div>
      </div>
      <div className="flex items-center justify-center">
        {/* 언어 변경기능 아직 미구현 */}
        <div
          className="cursor-pointer text-slate-500"
          onClick={() => {
            setEng((eng: boolean) => !eng)
          }}
        >
          {/* 클릭시 색상 변경 기능만 구현 */}
          {eng ? (
            <span className="text-white">ENG</span>
          ) : (
            <span className="text-slate-600">ENG</span>
          )}
        </div>
        <span className="ml-2 mr-4">l</span>
        {/* 임시 profile icon */}
        <FiUser className="size-6 cursor-pointer" />
      </div>
    </header>
  )
}
