import { Button } from '@/components/shadcn/button'
import { Separator } from '@/components/shadcn/separator'
import { cn } from '@/libs/utils'
import GrayInfoIcon from '@/public/icons/info-gray.svg'
import TrashCanIconGray from '@/public/icons/trashcan2-gray.svg'
import Image from 'next/image'
import { useRef, useState } from 'react'

interface Testcase {
  id: number
  type: 'Automatic' | 'Manual'
  input: string
  output: string
}

export function TestcasePage() {
  const [testcases, setTestcases] = useState<Testcase[]>([])
  const id = useRef(1)

  // TODO: 최초에 서버에서 불러온 테스트 케이스로 testcases 상태 초기화.
  // TODO: container에서 저장하기 버튼 클릭 시 로직 구현

  const addTestcase = () => {
    setTestcases((prev) =>
      prev.concat({
        id: id.current,
        type: 'Manual',
        input: '',
        output: ''
      })
    )
    id.current++
  }

  const removeAll = () => {
    id.current = 0
    setTestcases([])
  }

  return (
    <div className="border-1 border-color-cool-neutral-90 flex flex-col gap-5 rounded-2xl px-6 py-7">
      <div className="flex flex-col gap-5">
        <div className="flex justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-head5_sb_24">테스트 케이스</p>
            <p className="text-body2_m_14 text-color-cool-neutral-40">
              Input과 Output 쌍을 직접 장성하는 방식입니다. (각 케이스는 하나의
              .in/.out 쌍으로 간주)
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={removeAll}
              className="text-sub4_sb_14 text-primary itmes-center border-primary-light hover:bg-color-blue-95 rounded-lg border-[1.4px] bg-white px-3 py-[10px]"
            >
              전체 삭제
            </Button>
            <Button
              type="button"
              onClick={addTestcase}
              className="text-sub4_sb_14 text-primary itmes-center border-primary-light hover:bg-color-blue-95 rounded-lg border-[1.4px] bg-white px-3 py-[10px]"
            >
              테스트 케이스 추가
            </Button>
          </div>
        </div>
        <Separator className="bg-line" />
      </div>
      {testcases.length === 0 ? (
        <div className="bg-color-neutral-99 flex flex-col items-center gap-2 rounded-xl py-20">
          <Image src={GrayInfoIcon} alt="gray info icon" width={24} />
          <p className="text-body1_m_16 text-color-cool-neutral-50 whitespace-pre-line text-center">
            {
              '아직 테스트 케이스가 존재하지 않습니다.\n테스트 케이스 추가 버튼을 눌러 생성해주세요.'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {testcases.map((tc) => (
            <div key={tc.id}>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <p className="text-sub1_sb_18">Sample {tc.id}</p>
                  <p
                    className={cn(
                      'text-caption1_m_13 rounded-sm px-[10px] py-1',
                      {
                        'bg-color-blue-95 text-primary':
                          tc.type === 'Automatic',
                        'bg-color-yellow-95 text-color-orange-50':
                          tc.type === 'Manual'
                      }
                    )}
                  >
                    {tc.type}
                  </p>
                </div>
                <Button
                  onClick={() =>
                    setTestcases((prev) => prev.filter((p) => p.id !== tc.id))
                  }
                  type="button"
                  className="border-color-neutral-90 hover:bg-color-neutral-95 border-1 bg-color-neutral-99 rounded-full px-4 py-[10px]"
                >
                  <Image
                    src={TrashCanIconGray}
                    alt="trashcan icon gray"
                    height={16}
                    width={16}
                  />
                </Button>
              </div>
              <div className="flex justify-between gap-3">
                <div className="flex flex-1 flex-col gap-2">
                  <p className="text-sub4_sb_14 text-color-cool-neutral-40 h-fit">
                    Input {tc.id}
                  </p>
                  <textarea className="bg-editor-background-1 h-full min-h-[146px] rounded-lg px-3 py-2 font-mono text-white" />
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <p className="text-sub4_sb_14 text-color-cool-neutral-40 h-fit">
                    Output {tc.id}
                  </p>
                  <textarea className="bg-editor-background-1 h-full min-h-[146px] rounded-lg px-3 py-2 font-mono text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
