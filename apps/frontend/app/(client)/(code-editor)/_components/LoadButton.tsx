'use client'

import { useCodeStore } from '@/stores/editor'

export function LoadButton({ code }: { code: string }) {
  const setCode = useCodeStore((s) => s.setCode)

  return (
    <button
      className="size-7 h-8 w-[77px] shrink-0 gap-[5px] rounded-[4px] bg-slate-600 font-normal text-white hover:bg-slate-700"
      onClick={() => setCode(code)}
    >
      Load
    </button>
  )
}
