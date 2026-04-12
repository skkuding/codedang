import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import { useRef } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'

interface StatementForm {
  basicInfo: {
    title: string
    timeLimit?: number
    memoryLimit?: number
  }
  problemInfo: {
    description: string
    input: string
    output: string
  }
  samples: { id: number; input: string; output: string }[]
}

export function StatementPage() {
  const idRef = useRef(1)

  const { control, register } = useForm<StatementForm>({
    defaultValues: {
      basicInfo: {
        title: '',
        timeLimit: undefined,
        memoryLimit: undefined
      },
      problemInfo: {
        description: '',
        input: '',
        output: ''
      },
      samples: [
        {
          id: 1,
          input: '',
          output: ''
        }
      ]
    }
  })

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'samples'
  })

  return (
    <form id="form-statement">
      <div className="grid gap-6">
        <div className="grid gap-6 rounded-2xl bg-white pb-7">
          <div className="text-title1_sb_20 text-color-cool-neutral-5 border-b-1 border-line px-6 py-4">
            기본 정보
          </div>
          <div className="grid gap-5 px-6">
            <div className="grid gap-1">
              <label
                htmlFor="form-statement-basicInfo-title"
                className="text-caption2_m_12 text-color-neutral-15 w-fit"
              >
                제목
              </label>
              <Controller
                control={control}
                name="basicInfo.title"
                render={({ field }) => (
                  <Input
                    id="form-statement-basicInfo-title"
                    {...field}
                    className="text-body1_m_16 placeholder:text-color-neutral-90 px-5 py-[11px]"
                    placeholder="예시) 최단 경로 찾기"
                  />
                )}
              />
            </div>
            <div className="flex justify-between gap-2">
              <div className="grid flex-1 gap-1">
                <label
                  htmlFor="form-statement-basicInfo-timeLimit"
                  className="text-caption2_m_12 text-color-neutral-15 w-fit"
                >
                  시간제한 (ms)
                </label>
                <Input
                  id="form-statement-basicInfo-timeLimit"
                  className="placeholder:text-body1_m_16! text-body1_m_16 placeholder:text-color-neutral-90 px-5 py-[11px]"
                  placeholder="Enter"
                />
              </div>
              <div className="grid flex-1 gap-1">
                <label
                  htmlFor="form-statement-basicInfo-memoryLimit"
                  className="text-caption2_m_12 text-color-neutral-15 w-fit"
                >
                  메모리제한 (KB)
                </label>
                <Input
                  id="form-statement-basicInfo-memoryLimit"
                  className="text-body1_m_16 placeholder:text-color-neutral-90 px-5 py-[11px]"
                  placeholder="Enter"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-6 rounded-2xl bg-white pb-7">
          <div className="text-title1_sb_20 text-color-cool-neutral-5 border-b-1 border-line px-6 py-4">
            문제
          </div>
          <div className="grid gap-5 px-6">
            <div className="grid gap-1">
              <p className="text-caption2_m_12 text-color-neutral-15">본문</p>
              <textarea
                className="border-1 border-line text-body1_m_16 focus-visible:outline-hidden focus-visible:ring-primary placeholder:text-color-neutral-90 min-h-[179px] resize-none rounded-xl px-5 py-[11px] focus-visible:ring-1 focus-visible:ring-offset-0"
                placeholder="이곳에 문제 설명을 작성하세요."
              />
            </div>
            <div className="flex justify-between gap-2">
              <div className="grid flex-1 gap-1">
                <p className="text-caption2_m_12 text-color-neutral-15">입력</p>
                <textarea
                  className="border-1 border-line text-body1_m_16 focus-visible:outline-hidden focus-visible:ring-primary placeholder:text-color-neutral-90 min-h-[179px] resize-none rounded-xl px-5 py-[11px] focus-visible:ring-1 focus-visible:ring-offset-0"
                  placeholder="이곳에 입력 형식을 작성하세요."
                />
              </div>
              <div className="grid flex-1 gap-1">
                <p className="text-caption2_m_12 text-color-neutral-15">출력</p>
                <textarea
                  className="border-1 border-line text-body1_m_16 focus-visible:outline-hidden focus-visible:ring-primary placeholder:text-color-neutral-90 min-h-[179px] resize-none rounded-xl px-5 py-[11px] focus-visible:ring-1 focus-visible:ring-offset-0"
                  placeholder="이곳에 출력 형식을 작성하세요."
                />
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-6 rounded-2xl bg-white pb-7">
          <div className="border-b-1 border-line flex items-center justify-between px-6 py-4">
            <p className="text-title1_sb_20 text-color-cool-neutral-5">
              예제 데이터 (Samples)
            </p>
            <Button
              type="button"
              className="border-primary-light hover:bg-color-blue-95 h-fit rounded-lg border bg-white px-[10px] py-[6px]"
            >
              <p className="text-caption3_r_13 text-primary">추가하기</p>
            </Button>
          </div>
          <div className="flex justify-between gap-2 px-6">
            <div className="grid flex-1 gap-1">
              <p className="text-caption2_m_12 text-color-neutral-15">
                입력 예제 #1
              </p>
              <textarea
                className="border-1 border-line text-body1_m_16 focus-visible:outline-hidden focus-visible:ring-primary placeholder:text-color-neutral-90 min-h-[179px] resize-none rounded-xl px-5 py-[11px] focus-visible:ring-1 focus-visible:ring-offset-0"
                placeholder="Enter"
              />
            </div>
            <div className="grid flex-1 gap-1">
              <p className="text-caption2_m_12 text-color-neutral-15">
                출력 예제 #1
              </p>
              <textarea
                className="border-1 border-line text-body1_m_16 focus:outline-hidden focus:ring-primary placeholder:text-color-neutral-90 min-h-[179px] resize-none rounded-xl px-5 py-[11px] ring-transparent focus:ring-1 focus:ring-offset-0"
                placeholder="Enter"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
