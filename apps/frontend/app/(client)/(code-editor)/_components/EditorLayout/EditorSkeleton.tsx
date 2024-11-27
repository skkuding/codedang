import clockIcon from '@/public/icons/clock.svg'
import codedangLogo from '@/public/logos/codedang-editor.svg'
import Image from 'next/image'

export default function EditorSkeleton() {
  return (
    <div className="grid-rows-editor grid h-dvh w-full min-w-[1000px] overflow-x-auto bg-slate-800 text-white">
      <header className="flex h-12 justify-between bg-slate-900 px-6">
        <div className="flex items-center justify-center gap-4 text-lg text-[#787E80]">
          <Image src={codedangLogo} alt="코드당" width={33} />
          <div className="flex items-center gap-1 font-medium">
            Contest
            <p className="mx-2"> / </p>
            Future Contest
            <p className="mx-2"> / </p>
            <button
              type="button"
              className="flex gap-1 text-lg text-white outline-none"
            >
              <h1>A. 정수 더하기</h1>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="text-error inline-flex items-center gap-2 whitespace-nowrap text-sm opacity-80">
            <Image src={clockIcon} alt="Clock" />
            Ends in
            <p className="overflow-hidden text-ellipsis whitespace-nowrap">
              365291 DAYS
            </p>
          </div>
          <div className="ml-2 flex items-center gap-2">
            <button
              type="button"
              className="hidden items-center gap-2 rounded-md border-0 px-4 py-1 md:flex"
            />
            <button type="button" className="flex gap-2 px-4 py-1 md:hidden" />
          </div>
        </div>
      </header>
      <div className="flex h-full w-full border border-slate-700">
        <div className="w-1/3 min-w-[500px] border-r border-slate-700">
          <div className="h-full bg-[#222939]">
            <div className="text-muted-foreground inline-flex h-9 items-center justify-center rounded-lg bg-slate-900 p-1">
              <button
                type="button"
                className="rounded-md bg-slate-700 px-3 py-1 text-sm font-medium"
              >
                Description
              </button>
              <button
                type="button"
                className="rounded-md px-3 py-1 text-sm font-medium"
              >
                Submissions
              </button>
            </div>
            <div className="px-6 py-6 text-lg text-slate-300">
              <h1 className="mb-3 text-xl font-bold">#1. 정수 더하기</h1>
              <p>
                두 정수 A와 B를 입력받은 다음, A+B를 출력하는 프로그램을
                작성하시오. 첫째 줄에 A와 B가 주어진다. (0 &lt; A, B &lt; 10)
                첫째 줄에 A+B를 출력한다.
              </p>
              <hr className="my-4 border-slate-700" />
              <h2 className="mb-3 font-bold">Input</h2>
              <p>첫째 줄에 A와 B가 주어진다. (0 &lt; A, B &lt; 10)</p>
              <hr className="my-4 border-slate-700" />
              <h2 className="mb-3 font-bold">Output</h2>
              <p>첫째 줄에 A+B를 출력한다.</p>
            </div>
          </div>
        </div>
        <div className="relative w-px bg-slate-500" role="separator" />
        <div className="w-2/3 bg-[#222939]">
          <div className="flex h-12 items-center justify-end border-b border-slate-700 bg-[#222939] px-6">
            <button
              type="button"
              className="h-8 w-[77px] rounded-md bg-slate-600 text-red-500"
            >
              Reset
            </button>
            <button
              type="button"
              className="h-8 w-[77px] rounded-md bg-[#D7E5FE] text-[#484C4D]"
            >
              Save
            </button>
            <button
              type="button"
              className="h-8 w-[77px] rounded-md bg-[#D7E5FE] text-[#484C4D]"
            >
              Test
            </button>
            <button
              type="button"
              className="bg-primary h-8 w-[77px] rounded-md text-gray-50"
            >
              Submit
            </button>
            <button type="button" className="h-8 w-10 rounded-md bg-slate-600">
              C
            </button>
          </div>
          <div className="h-full bg-[#121728] p-4">
            <pre className="h-96 overflow-auto rounded-md bg-[#222939] p-4 font-mono text-sm text-gray-300" />
          </div>
        </div>
      </div>
    </div>
  )
}
