'use client'

import codedangLogo from '@/public/logos/codedang-editor.svg'
import Image from 'next/image'

export function LogInPage() {
  return (
    <div className="flex w-[500px] flex-col items-start gap-8 rounded-2xl border border-[#DCE3E5] bg-white px-6 pb-9 pt-12">
      <div className="flex w-full flex-col items-center gap-5">
        <Image
          src={codedangLogo}
          alt="codedang"
          width={71.246}
          height={35.84}
          className="h-[35.84px] w-[71.246px]"
        />
        <h1 className="text-head5_sb_24 text-center">코드당에 어서오세요!</h1>
      </div>
    </div>
  )
}
