'use client'

import icon from '@/app/favicon.ico'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
// FIXME: react-icons library 사용하지 않기
import { FiUser } from 'react-icons/fi'
import { IoIosArrowForward } from 'react-icons/io'

interface HeaderEditorProps {
  id: number
  title: string
}

export default function HeaderEditor({ id, title }: HeaderEditorProps) {
  const [eng, setEng] = useState(false) // FIXME: query로 받아오기
  return (
    <header className="flex justify-between bg-slate-800 px-4">
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
      <div className="flex items-center justify-center gap-3">
        {/* 언어 변경기능 아직 미구현 */
        /* FIXME: Link로 변경하기 */}
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
        <div className="h-3 border-l border-white/80" />
        {/* 임시 profile icon */}
        <FiUser className="size-6 cursor-pointer" />
      </div>
    </header>
  )
}
