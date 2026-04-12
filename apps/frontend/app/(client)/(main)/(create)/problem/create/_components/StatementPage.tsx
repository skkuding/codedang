import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import { LucideCircleMinus } from 'lucide-react'
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
  samples: { sampleId: number; input: string; output: string }[]
}

// 머지 전에
// 1. 개별 샘플 삭제 디자인 컨펌
// 2. problem container 배경색 원복
export function StatementPage() {
  const sampleIdRef = useRef(1)

  const { control, register, handleSubmit } = useForm<StatementForm>({
    defaultValues: {
      basicInfo: {
        title: '',
        timeLimit: '' as unknown as number, //uncontroll -> controll로 바뀌는 에러 해결을 위한 타입 명시
        memoryLimit: '' as unknown as number
      },
      problemInfo: {
        description: '',
        input: '',
        output: ''
      },
      samples: [
        {
          sampleId: 1,
          input: '',
          output: ''
        }
      ]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'samples'
  })

  // TODO: 올바른 제출 로직 구현 (추후 백엔드 연동 시)
  const submitForm = handleSubmit((data) => {
    console.log(data)
  })

  const appendSample = () => {
    append({ sampleId: ++sampleIdRef.current, input: '', output: '' })
  }

  const removeSample = (idx: number) => {
    remove(idx)
  }

  return (
    <form id="form-statement" onSubmit={submitForm}>
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
                <Controller
                  control={control}
                  name="basicInfo.timeLimit"
                  render={({ field }) => (
                    <Input
                      id="form-statement-basicInfo-timeLimit"
                      {...field}
                      type="number"
                      className="placeholder:text-body1_m_16! text-body1_m_16 placeholder:text-color-neutral-90 px-5 py-[11px]"
                      placeholder="Enter"
                    />
                  )}
                />
              </div>
              <div className="grid flex-1 gap-1">
                <label
                  htmlFor="form-statement-basicInfo-memoryLimit"
                  className="text-caption2_m_12 text-color-neutral-15 w-fit"
                >
                  메모리제한 (KB)
                </label>
                <Controller
                  control={control}
                  name="basicInfo.memoryLimit"
                  render={({ field }) => (
                    <Input
                      id="form-statement-basicInfo-memoryLimit"
                      {...field}
                      type="number"
                      className="text-body1_m_16 placeholder:text-color-neutral-90 px-5 py-[11px]"
                      placeholder="Enter"
                    />
                  )}
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
              <label
                htmlFor="form-statement-problemInfo-description"
                className="text-caption2_m_12 text-color-neutral-15 w-fit"
              >
                본문
              </label>
              <textarea
                id="form-statement-problemInfo-description"
                {...register('problemInfo.description')}
                className="border-1 border-line text-body1_m_16 focus-visible:outline-hidden focus-visible:ring-primary placeholder:text-color-neutral-90 min-h-[179px] resize-none rounded-xl px-5 py-[11px] focus-visible:ring-1 focus-visible:ring-offset-0"
                placeholder="이곳에 문제 설명을 작성하세요."
              />
            </div>
            <div className="flex justify-between gap-2">
              <div className="grid flex-1 gap-1">
                <label
                  htmlFor="form-statement-problemInfo-input"
                  className="text-caption2_m_12 text-color-neutral-15 w-fit"
                >
                  입력
                </label>
                <textarea
                  id="form-statement-problemInfo-input"
                  {...register('problemInfo.input')}
                  className="border-1 border-line text-body1_m_16 focus-visible:outline-hidden focus-visible:ring-primary placeholder:text-color-neutral-90 min-h-[179px] resize-none rounded-xl px-5 py-[11px] focus-visible:ring-1 focus-visible:ring-offset-0"
                  placeholder="이곳에 입력 형식을 작성하세요."
                />
              </div>
              <div className="grid flex-1 gap-1">
                <label
                  htmlFor="form-statement-problemInfo-output"
                  className="text-caption2_m_12 text-color-neutral-15 w-fit"
                >
                  출력
                </label>
                <textarea
                  id="form-statement-problemInfo-output"
                  {...register('problemInfo.output')}
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
              onClick={appendSample}
              className="border-primary-light hover:bg-color-blue-95 h-fit rounded-lg border bg-white px-[10px] py-[6px]"
            >
              <p className="text-caption3_r_13 text-primary">추가하기</p>
            </Button>
          </div>
          {fields.map((field, i) => (
            <div key={field.id} className="flex justify-between gap-2 px-6">
              <div className="grid flex-1 gap-1">
                <label
                  htmlFor={`form-statement-sample${field.sampleId}-input`}
                  className="text-caption2_m_12 text-color-neutral-15 w-fit"
                >
                  입력 예제 #{i + 1}
                </label>
                <textarea
                  id={`form-statement-sample${field.sampleId}-input`}
                  {...register(`samples.${i}.input`)}
                  className="border-1 border-line text-body1_m_16 focus-visible:outline-hidden focus-visible:ring-primary placeholder:text-color-neutral-90 min-h-[179px] resize-none rounded-xl px-5 py-[11px] focus-visible:ring-1 focus-visible:ring-offset-0"
                  placeholder="Enter"
                />
              </div>
              <div className="grid flex-1 gap-1">
                <div className="flex justify-between">
                  <label
                    htmlFor={`form-statement-sample${field.sampleId}-output`}
                    className="text-caption2_m_12 text-color-neutral-15 w-fit"
                  >
                    출력 예제 #{i + 1}
                  </label>
                  {/* TODO: sample 개별 삭제 버튼 디자인 반영 */}
                  <LucideCircleMinus
                    size={16}
                    className="text-color-neutral-80 hover:text-color-neutral-50 cursor-pointer"
                    onClick={() => removeSample(i)}
                  />
                </div>
                <textarea
                  id={`form-statement-sample${field.sampleId}-output`}
                  {...register(`samples.${i}.output`)}
                  className="border-1 border-line text-body1_m_16 focus-visible:outline-hidden focus-visible:ring-primary placeholder:text-color-neutral-90 min-h-[179px] resize-none rounded-xl px-5 py-[11px] focus-visible:ring-1 focus-visible:ring-offset-0"
                  placeholder="Enter"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  )
}
