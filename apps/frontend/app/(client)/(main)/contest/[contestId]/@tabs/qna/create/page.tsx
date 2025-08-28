'use client'

import { QnaForm } from './_components/QnaForm'

export default function Page() {
  return (
    <div className="flex w-screen min-w-[960px] max-w-[1440px] flex-col px-[116px] pt-[80px]">
      <div className="mb-[30px] flex items-center">
        <h1 className="font-pretendard text-2xl font-medium leading-[120%] tracking-[-0.72px] text-black">
          Post New Question
        </h1>
      </div>

      <QnaForm />
    </div>
  )
}
