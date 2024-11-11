'use client'

import { cn, getResultColor } from '@/lib/utils'
import type { TestResultDetail } from '@/types/type'
import { useState } from 'react'
import { CiSquarePlus } from 'react-icons/ci'
import { IoMdClose } from 'react-icons/io'
import TestcaseTable from './TestcaseTable'
import { WhitespaceVisualizer } from './WhitespaceVisualizer'
import { ScrollArea } from './ui/scroll-area'

interface TestcasePanelProps {
  testResult: TestResultDetail[]
}

export default function TestcasePanel({ testResult }: TestcasePanelProps) {
  const [testcaseTabList, setTestcaseTabList] = useState<TestResultDetail[]>([])
  const [currentTab, setCurrentTab] = useState<number>(0)
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

  // Add User Testcase Button Click Handler
  const handleAddUserTestcase = () => {
    console.log('Add User Testcase clicked')
    // Here you would add logic to handle adding a new user testcase
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
        <div
          className={cn(
            'flex flex-grow border-l border-[#222939] bg-[#121728]',
            currentTab === testcaseTabList[testcaseTabList.length - 1]?.id &&
              'rounded-bl-xl',
            currentTab === 0 && testcaseTabList.length === 0 && 'rounded-bl-xl'
          )}
        >
          <div className="ml-auto mr-2">
            <button
              onClick={handleAddUserTestcase}
              className="my-2 flex h-8 items-center justify-end gap-1 rounded-[5px] bg-slate-600 px-2 py-2 text-white"
            >
              <CiSquarePlus className="mr-2" />
              Add User Testcase
            </button>
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
