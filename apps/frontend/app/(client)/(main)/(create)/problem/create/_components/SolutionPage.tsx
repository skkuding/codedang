import { Button } from '@/components/shadcn/button'
import { Separator } from '@/components/shadcn/separator'
import { cn } from '@/libs/utils'
import BlueCheckIcon from '@/public/icons/check-blue.svg'
import CodingIcon from '@/public/icons/coding.svg'
import InfoIconGray from '@/public/icons/info-icon-gray.svg'
import TrashCanIconGray from '@/public/icons/trashcan2-gray.svg'
import Image from 'next/image'
import { useRef, useState } from 'react'

const LANGUAGE_DISPLAY_MAP: Record<string, string> = {
  cpp: 'C++17',
  c: 'C11',
  cc: 'C++17',
  'c++': 'C++20',
  java: 'Java 11',
  kt: 'Kotlin 1.9',
  kts: 'Kotlin Script',
  py: 'Python 3.11',
  ipynb: 'Jupyter Notebook',
  js: 'JavaScript (Node.js)',
  ts: 'TypeScript 5.0',
  jsx: 'React JS',
  tsx: 'React TS',
  go: 'Go 1.21',
  rs: 'Rust 1.75',
  swift: 'Swift 5.9',
  sh: 'Shell Script',
  rb: 'Ruby 3.2',
  cs: 'C# 12 (.NET 8)',
  php: 'PHP 8.2',
  sql: 'SQL (PostgreSQL)',
  html: 'HTML5',
  css: 'CSS3',
  json: 'JSON Meta',
  md: 'Markdown'
}

interface SolutionFile {
  file: File
  testResult: {
    isPassed: boolean
    passedInfo: {
      date: string
      passNo: number
      totalPassed: number
    } | null
  }
}

export function SolutionPage() {
  // TODO: DB에서 가져온 기존 파일들로 초기화해야함
  const [solutionFiles, setSolutionFiles] = useState<SolutionFile[]>([])
  const inputFileRef = useRef<HTMLInputElement | null>(null)

  const UplaodFile = (inputFiles: FileList) => {
    const solutionFiles = Array.from(inputFiles).map(
      (file) =>
        ({
          file,
          testResult: { isPassed: false }
        }) as SolutionFile
    )
    setSolutionFiles((prev) => solutionFiles.concat(prev))
  }

  const DeleteFile = (solutionFile: SolutionFile) => {
    setSolutionFiles((prev) => prev.filter((f) => f !== solutionFile))
  }

  // TODO: TestFile 함수 백엔드 함수와 통신하도록 변경해야 함 (제출 후 버튼 disable 로직 추가 필요)
  const TestFile = (solutionFile: SolutionFile) => {
    setSolutionFiles((prev) =>
      prev.map((f) =>
        f === solutionFile
          ? ({
              file: f.file,
              testResult: {
                isPassed: true,
                passedInfo: {
                  date: '2019. 01. 01',
                  passNo: 1,
                  totalPassed: 2
                }
              }
            } as SolutionFile)
          : f
      )
    )
  }

  return (
    <div className="border-1 border-color-cool-neutral-90 rounded-2xl px-6 py-7">
      <input
        onChange={(event) => {
          event.target.files && UplaodFile(event.target.files)
        }}
        ref={inputFileRef}
        multiple
        className="hidden"
        type="file"
      />
      <header className="flex justify-between">
        <div className="grid gap-1">
          <div className="flex items-center gap-2">
            <p className="text-head5_sb_24">솔루션 파일 업로드</p>
            <div className="bg-color-blue-90 text-primary text-caption1_m_13 h-fit rounded-sm px-2 py-1">
              필수
            </div>
          </div>
          <p className="text-body2_m_14 text-color-cool-neutral-40">
            참고 솔루션 (정답 코드)을 업로드하고, 테스트 케이스와 함께
            검증하세요
          </p>
        </div>
        <Button
          onClick={() => inputFileRef.current?.click()}
          type="button"
          className="text-sub4_sb_14 text-primary border-primary-light hover:bg-color-blue-95 rounded-lg border-[1.4px] bg-white px-3 py-[10px]"
        >
          솔루션 업로드
        </Button>
      </header>
      <Separator className="my-5" />
      <main className="grid gap-6">
        {solutionFiles.length === 0 ? (
          <div className="bg-color-neutral-99 flex flex-col items-center gap-[10px] rounded-xl py-20">
            <Image
              src={InfoIconGray}
              alt="info icon gray"
              height={24}
              width={24}
            />
            <p className="text-color-cool-neutral-50 text-body1_m_16 whitespace-pre-wrap text-center">
              {
                '아직 솔루션이 업로드 되지 않았습니다.\n배포/Ready 상태 전환을 위해 솔루션 파일 업로드가 필수입니다.'
              }
            </p>
          </div>
        ) : (
          solutionFiles.map((solutionFile, idx) => {
            const file = solutionFile.file
            const fileName = file.name
            const fileExtension = fileName
              .substring(fileName.lastIndexOf('.') + 1)
              .toLowerCase()
            const fileSize = Math.floor((file.size / 1000) * 10) / 10

            // TODO: 아래 데이터들 실제 백엔드 API 통신 값으로 바꾸기
            // (특히 테스트 통과 시 정보들을 )
            const testGroupCnt = 0
            const matchedCnt = 0
            const missingCnt = 0

            const { isPassed: testPassed, passedInfo: passedInfo } =
              solutionFile.testResult

            return (
              <div
                key={fileName.concat(idx.toString())}
                className="grid gap-2 rounded-xl p-4 shadow-[0px_4px_20px_0px_rgba(53,78,116,0.10)]"
              >
                <div className="flex gap-4">
                  <div className="bg-color-neutral-99 border-line w-fit rounded-[6.4px] border-[0.8px] p-3">
                    <Image
                      src={CodingIcon}
                      alt="coding icon"
                      height={24}
                      width={24}
                    />
                  </div>
                  <div className="flex flex-1 items-center justify-between">
                    <div className="grid gap-[2px]">
                      <p className="text-sub1_sb_18">{fileName}</p>
                      <div className="flex items-center gap-[1px]">
                        <p className="text-sub4_sb_14 text-color-cool-neutral-40">
                          {fileSize}KB
                        </p>
                        <p className="bg-color-neutral-30 m-2 h-1 w-1 rounded-full" />
                        <p className="text-sub4_sb_14 text-color-cool-neutral-40">
                          {LANGUAGE_DISPLAY_MAP[fileExtension]}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => DeleteFile(solutionFile)}
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
                </div>
                <div className="text-sub3_sb_16 flex w-full py-5 ps-16">
                  <div className="flex flex-1 items-center justify-center gap-2 px-10 py-1">
                    <p className="text-color-cool-neutral-30 truncate">
                      테스트 그룹
                    </p>
                    <p className="text-color-cool-neutral-30">{testGroupCnt}</p>
                  </div>
                  <Separator orientation="vertical" />
                  <div className="text-color-cool-neutral-30 flex flex-1 items-center justify-center gap-2 px-10 py-1">
                    <p className="text-primary">Matched</p>
                    <p className="text-color-cool-neutral-30">{matchedCnt}</p>
                  </div>
                  <Separator orientation="vertical" />
                  <div className="text-color-cool-neutral-30 flex flex-1 items-center justify-center gap-2 px-10 py-1">
                    <p className="text-flowkit-red">Missing</p>
                    <p className="text-color-cool-neutral-30">{missingCnt}</p>
                  </div>
                </div>
                <div
                  className={cn(
                    'flex justify-between rounded-xl p-4',
                    testPassed
                      ? 'border-1 border-primary-light bg-color-blue-95'
                      : 'border-1 bg-color-neutral-99 border-transparent'
                  )}
                >
                  <div className="flex items-start gap-2">
                    <Image
                      src={testPassed ? BlueCheckIcon : InfoIconGray}
                      alt="test passed icon"
                      height={20}
                      width={20}
                    />
                    <div className="grid gap-[2px]">
                      <p
                        className={cn(
                          'text-sub3_sb_16',
                          testPassed
                            ? 'text-primary-strong'
                            : 'text-color-neutral-30'
                        )}
                      >
                        {testPassed ? '테스트 통과' : '테스트 실행 필요'}
                      </p>
                      <div
                        className={cn(
                          'text-caption1_m_13',
                          testPassed ? 'text-primary' : 'text-color-neutral-50'
                        )}
                      >
                        {testPassed && passedInfo ? (
                          <div className="flex items-center gap-[1px]">
                            <p>{passedInfo.date}</p>
                            <p className="bg-primary m-2 h-1 w-1 rounded-full" />
                            <p>
                              {passedInfo.passNo}/{passedInfo.totalPassed}{' '}
                              솔루션 테스트 통과 완료
                            </p>
                          </div>
                        ) : (
                          '솔루션 테스트를 실행해주세요'
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => TestFile(solutionFile)}
                    type="button"
                    className="text-sub4_sb_14 text-primary border-primary-light hover:bg-color-blue-95 rounded-lg border-[1.4px] bg-white px-3 py-[10px]"
                  >
                    테스트 실행
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </main>
    </div>
  )
}
