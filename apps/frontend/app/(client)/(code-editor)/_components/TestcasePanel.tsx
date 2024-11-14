'use client'

import { Button } from '@/components/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/shadcn/dialog'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import { Textarea } from '@/components/shadcn/textarea'
import { cn, getResultColor } from '@/lib/utils'
import type { TestResultDetail } from '@/types/type'
import { useState } from 'react'
import { CiSquarePlus } from 'react-icons/ci'
import { FaCircleCheck } from 'react-icons/fa6'
import { FaPlus } from 'react-icons/fa6'
import { IoIosClose } from 'react-icons/io'
import { IoMdClose } from 'react-icons/io'
import TestcaseTable from './TestcaseTable'
import { WhitespaceVisualizer } from './WhitespaceVisualizer'

interface TestcasePanelProps {
  testResult: TestResultDetail[]
}

interface UserTestcaseProps {
  id: number
  input: string
  output: string
}

export default function TestcasePanel({ testResult }: TestcasePanelProps) {
  const [testcaseTabList, setTestcaseTabList] = useState<TestResultDetail[]>([])
  const [currentTab, setCurrentTab] = useState<number>(0)
  const sampleTestcase = testResult.map((testcase) => ({
    input: testcase.input,
    output: testcase.expectedOutput
  }))
  const acceptedCount = testResult.filter(
    (testcase) => testcase.result === 'Accepted'
  ).length
  const total = testResult.length
  const dataWithIndex = testResult.map((testcase, index) => ({
    ...testcase,
    id: index + 1
  }))
  const notAcceptedIndexes = dataWithIndex
    .map((testcase, index) => (testcase.result !== 'Accepted' ? index : -1))
    .filter((index) => index !== -1)
  const [userTestcase, setUserTestcase] = useState<UserTestcaseProps[]>([])
  function handleAddClick() {
    const newUserTestcase: UserTestcaseProps = {
      id: userTestcase.length + 1,
      input: 'demo user input',
      output: 'demo user output'
    }
    setUserTestcase([...userTestcase, newUserTestcase])
  }

  return (
    <>
      <div className="flex h-12">
        <div
          className={cn(
            'w-44 cursor-pointer content-center text-center',
            currentTab === 0 ? 'bg-[#222939]' : 'bg-[#121728]',
            testcaseTabList.length > 0 &&
              currentTab === testcaseTabList[0].id &&
              'rounded-br-xl'
          )}
          onClick={() => setCurrentTab(0)}
        >
          {testcaseTabList.length < 7 ? 'Testcase Result' : 'TC Res'}
        </div>

        <div
          className={cn(
            'flex flex-grow border-l border-[#222939] bg-[#121728]',
            currentTab === testcaseTabList[testcaseTabList.length - 1]?.id &&
              'rounded-bl-xl',
            currentTab === 0 && testcaseTabList.length === 0 && 'rounded-bl-xl'
          )}
        >
          <div
            className="w-[412px]" /*이렇게 roughf하게 잡는게 좋은 방법인가?*/
          >
            <ScrollArea className="w-full">
              <div className="flex h-12 flex-row overflow-x-scroll">
                {testcaseTabList.map((testcase, index) => (
                  <TestcaseTab
                    testcaseTabList={testcaseTabList}
                    setTestcaseTabList={setTestcaseTabList}
                    currentTab={currentTab}
                    setCurrentTab={setCurrentTab}
                    testcase={testcase}
                    index={index}
                    key={testcase.id}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="mx-2 ml-auto">
            <Dialog>
              <DialogTrigger asChild>
                <button className="my-2 flex h-8 w-[148px] items-center justify-center gap-2 rounded-[5px] bg-slate-600 p-2 text-white">
                  <CiSquarePlus size={24} />
                  Add Testcase
                </button>
              </DialogTrigger>

              <DialogContent className="w-[700px] max-w-[700px] bg-[#121728] px-14 pt-[70px]">
                <ScrollArea className="h-[600px]">
                  <DialogHeader>
                    <DialogTitle className="mb-8 text-white">
                      Add User Testcase
                    </DialogTitle>
                  </DialogHeader>

                  <div className="flex flex-col gap-6">
                    {sampleTestcase.map((testcase, index) => (
                      <div key={index} className="flex flex-col gap-2">
                        <p className="text-[#C4CACC]">
                          Sample #{(index + 1).toString().padStart(2, '0')}
                        </p>
                        <SampleTestcase testcase={testcase} />
                      </div>
                    ))}
                    {userTestcase.map((testcase, index) => (
                      <UserTestcaseField
                        key={index}
                        testcase={testcase}
                        index={index}
                      />
                    ))}

                    <UserTestcaseField
                      index={0}
                      testcase={{ id: 0, input: 'Input', output: 'Output' }}
                    />
                    <div>
                      <Button
                        onClick={handleAddClick}
                        className="flex w-full gap-2 bg-[#555C66] text-[#C4CACC]"
                      >
                        <FaPlus />
                        Add
                      </Button>
                    </div>
                    <div className="mt-3 flex flex-row justify-end gap-3">
                      <CancelButton />
                      <SaveButton />
                    </div>
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <ScrollArea className="h-full">
        {currentTab === 0 ? (
          <div className="flex flex-col gap-6 p-5 pb-14">
            <TestSummary
              acceptedCount={acceptedCount}
              total={total}
              notAcceptedIndexes={notAcceptedIndexes}
            />
            <TestcaseTable
              data={dataWithIndex}
              testcaseTabList={testcaseTabList}
              setTestcaseTabList={setTestcaseTabList}
              setCurrentTab={setCurrentTab}
            />
          </div>
        ) : (
          <TestResultDetail
            dataWithIndex={dataWithIndex}
            currentTab={currentTab}
          />
        )}
      </ScrollArea>
    </>
  )
}

function TestcaseTab({
  testcaseTabList,
  setTestcaseTabList,
  currentTab,
  setCurrentTab,
  testcase,
  index
}: {
  testcaseTabList: TestResultDetail[]
  setTestcaseTabList: (data: TestResultDetail[]) => void
  currentTab: number
  setCurrentTab: (data: number) => void
  testcase: TestResultDetail
  index: number
}) {
  function handleDelete(testcase: TestResultDetail) {
    const updatedList = testcaseTabList.filter(
      (item) => item.id !== testcase.id
    )
    setTestcaseTabList(updatedList)
    if (currentTab === testcase.id) {
      setCurrentTab(0)
    }
  }

  return (
    <div
      className={cn(
        'relative w-44 cursor-pointer border-l border-[#222939] bg-[#121728]',
        currentTab === 0 && index == 0 && 'rounded-bl-xl',
        currentTab === testcaseTabList[index - 1]?.id && 'rounded-bl-xl',
        currentTab === testcaseTabList[index + 1]?.id && 'rounded-br-xl'
      )}
    >
      <IoMdClose
        className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-gray-300"
        size={18}
        onClick={() => handleDelete(testcase)}
      />
      <div
        key={testcase.id}
        className={cn(
          'h-full content-center pr-6 text-center',
          currentTab === testcase.id && 'bg-[#222939]'
        )}
        onClick={() => setCurrentTab(testcase.id)}
      >
        {testcaseTabList.length < 7 ? 'Samples' : 'S'} #{testcase.id}
      </div>
    </div>
  )
}

function LabeledField({ label, text }: { label: string; text: string }) {
  return (
    <div className="min-w-40 flex-1">
      <div className="flex flex-col gap-4 p-4">
        <p className="text-slate-400">{label}</p>
        <hr className="border-[#303333]/50" />
        <WhitespaceVisualizer text={text} className="h-fit text-slate-300" />
      </div>
    </div>
  )
}

function TestSummary({
  acceptedCount,
  total,
  notAcceptedIndexes
}: {
  acceptedCount: number
  total: number
  notAcceptedIndexes: number[]
}) {
  return (
    <table className="min-w-full">
      <tbody>
        <tr>
          <td className="w-52 py-1 text-slate-400">Correct Testcase:</td>
          <td className="py-1 text-white">
            {acceptedCount}/{total}
          </td>
        </tr>
        {notAcceptedIndexes.length > 0 && (
          <tr>
            <td className="w-52 py-1 align-top text-slate-400">
              Wrong Testcase Number:
            </td>
            <td className="py-1 text-white">
              {notAcceptedIndexes
                .map((index) => `Sample #${index + 1}`)
                .join(', ')}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )
}

function TestResultDetail({
  dataWithIndex,
  currentTab
}: {
  dataWithIndex: TestResultDetail[]
  currentTab: number
}) {
  return (
    <div className="px-8 pt-5">
      <div className="flex w-full gap-4 rounded-md bg-[#121728] px-6 py-3 font-light text-neutral-400">
        Result
        <span className={getResultColor(dataWithIndex[currentTab - 1].result)}>
          {dataWithIndex[currentTab - 1].result}
        </span>
      </div>
      <div className="flex gap-4">
        <LabeledField
          label="Input"
          text={dataWithIndex[currentTab - 1].input}
        />
        <LabeledField
          label="Expected Output"
          text={dataWithIndex[currentTab - 1].expectedOutput}
        />
        <LabeledField
          label="Output"
          text={dataWithIndex[currentTab - 1].output}
        />
      </div>
    </div>
  )
}

function SampleTestcase({
  testcase
}: {
  testcase: { input: string; output: string }
}) {
  return (
    <div
      className={cn(
        'relative flex min-h-[80px] w-full rounded-md border border-[#313744] bg-[#222939] py-3 font-mono shadow-sm'
      )}
    >
      <Textarea
        value={testcase.input}
        className="resize-none border-0 px-4 py-0 text-white shadow-none focus-visible:ring-0"
      />
      <Textarea
        value={testcase.output}
        className="min-h-[80px] rounded-none border-l border-transparent border-l-[#313744] px-4 py-0 text-white shadow-none focus-visible:ring-0"
      />
    </div>
  )
}

function UserTestcaseField({
  testcase,
  index
}: {
  testcase: UserTestcaseProps
  index: number
}) {
  function handleDeleteClick() {
    //X아이콘을 누르면 호출되는 함수
    //X아이콘을 누르면 setUserTestcase 스테이트 핸들러 함수를 이용해서 userTestcase 배열에서 해당 테스트케이스를 삭제
  }
  return (
    <div>
      <p className="mb-2 text-[#619CFB]">
        User Testcase #{(index + 1).toString().padStart(2, '0')}
      </p>
      <div
        className={cn(
          'relative flex min-h-[80px] w-full rounded-md border border-[#DFDFDF] bg-white py-3 font-mono text-[#C2C2C2] shadow-sm'
        )}
      >
        <Textarea
          value={testcase.input}
          className="z-10 resize-none border-0 px-4 py-0 shadow-none focus-visible:ring-0"
        />
        <Textarea
          value={testcase.output}
          className="z-10 min-h-[80px] rounded-none border-l border-transparent border-l-gray-200 px-4 py-0 shadow-none focus-visible:ring-0"
        />
        <div className="absolute right-4 z-20 text-[#9B9B9B]">
          <IoIosClose size={25} onClick={handleDeleteClick} />
        </div>
      </div>
    </div>
  )
}

function CancelButton() {
  return (
    <div>
      <Button className="h-[40px] w-[78px] bg-[#DCE3E5] text-[#787E80]">
        Cancel
      </Button>
    </div>
  )
}

function SaveButton() {
  return (
    <div>
      <Button className="flex h-[40px] w-[95px] gap-2 bg-[#3581FA] text-white">
        <FaCircleCheck />
        Save
      </Button>
    </div>
  )
}
